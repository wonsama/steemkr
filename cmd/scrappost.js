const help = require('./help');
const {removeSpace2} = require('../util/wstring');
const {to} = require('../util/wutil');
const {sleep} = require('../util/wutil');
const {getHostAddr} = require('../util/wstring');

const steem = require('steem');
const ora = require('ora');
const axios = require('axios');
const cheerio = require('cheerio');
const dateFormat = require('dateformat');

// 파서
const padefault = require('./parser/padefault');
const pazdnet = require('./parser/pazdnet');
const painfoq = require('./parser/painfoq');


// 일단 기본 파서로 동작하지 않는 것만 처리하는 방향으로 ^^
// 본문 전체를 추출하는 것이 아니기 때문인지라 ...
const IS_PARSE_TEST = false;
const PARSERS = [
  { links:['zdnet.co.kr/news'], parser:pazdnet },
  { links:['infoq.com/news','infoq.com/minibooks','infoq.com/presentations'], parser:painfoq },
];

// 기본값
const DEFAULT_TAG = 'kr-scrap';  // 1개만 설정 가능 - category로도 사용되기 때문
const DEFAULT_BODY_LEN = 200;
const DEFAULT_UNIQUE_LEN = 15;
const STEEM_AUTHOR = process.env.STEEM_AUTHOR;
const STEEM_SCRAP_AUTHOR = process.env.STEEM_SCRAP_AUTHOR;
const STEEM_SCRAP_KEY_POSTING = process.env.STEEM_SCRAP_KEY_POSTING;

/*
* 파라미터 정보를 초기화 해준다
* @param args 외부로부터 입력받은 파라미터 
*/
function initParams(args)
{
	// 초기화
	args = args?args:[];	// new 처리 하므로 return 처리 해야 됨에 유의

	// 1번째 : 링크 - 필수입력 
	
  // 2번째 : 스크랩 작가
  if(args.length==1){
    if(STEEM_SCRAP_AUTHOR){
      args.push(STEEM_SCRAP_AUTHOR);
    }
  }

  // 3번째 : 스크랩 작가 포스팅 키
  if(args.length==2){
    if(STEEM_SCRAP_KEY_POSTING){
      args.push(STEEM_SCRAP_KEY_POSTING);
    }
  }

	return args;
}

/*
* frameset을 사용하여 link 정보를 변경할 필요가 있는 경우 처리
* @param link 호출 링크
* @return 변경된 링크정보
*/
function updateLink(link){
  // https://blog.naver.com/etripr/221329850354
  // https://blog.naver.com/PostView.nhn?blogId=etripr&logNo=221329850354

  let item = link.split(/\//).filter(x=>x!='');
  if(link.indexOf('blog.naver.com')>=0 && link.indexOf('PostView.nhn')<0 && item.length==4){
    return `https://blog.naver.com/PostView.nhn?blogId=${item[2]}&logNo=${item[3]}`;
  }

  return link;
}

/*
* 비동기 작업을 수행한다
* @param link 보팅할 주소 
* @param account 나의 계정명
* @param wif 나의 포스팅키
*/ 
let spinner;
async function processAsyc(link, account, wif){

  let err;
  
  // medium 사이트는 accept 가 반드시 존재해야 됨에 유의
  const AXIOS_CONFIG = {
    headers: {
      'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_13_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/67.0.3396.99 Safari/537.36',
      'accept':'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
      'accept-encoding': 'gzip, deflate, br',
      'accept-language': 'ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7'
    }
  };

  let linkInfo;
  let $;
  spinner = ora().start('loading link context');

  // 파싱이 가능한지 여부 파악
  let parser = padefault;
  for(let par of PARSERS){
    let arr = par.links.filter(lk=>link.indexOf(lk)>=0);
    if(arr.length==1){
      parser = par.parser;
      break;
    }
  }

  // frameset을 사용하여 link 정보를 변경할 필요가 있는 경우 처리 
  link = updateLink(link);

  // 파싱 수행
  // permlink에는 .이 포함되면 안됨에 유의하기 바랍니다.
  let context;
  if(!err){
    [err, linkInfo] = await to(axios.request(link, AXIOS_CONFIG));

    if(!err){

      // console.log(linkInfo.data);

      $ = cheerio.load(linkInfo.data);
      spinner.succeed();
      context = parser($, link, DEFAULT_TAG, DEFAULT_BODY_LEN, DEFAULT_UNIQUE_LEN);

      // console.log('context', context);
    }
  }

  // 파싱된 정보 확인
  // 기본 파서로 파싱, 오류발생 시 추후 해당 도메인에 매칭되는 파서 제작 유도
  let isContextEmpty = false;
  if(context){
    for(let con of Object.entries(context)){
      if(!con[1] || con[1]==''){
        isContextEmpty = true;
        break;
      }
    }
  }
  
  if(!context || isContextEmpty){
    err = `check context has empty value !`
  }
  
  // 파서 테스트를 하는 경우 파싱만 확인한다
  if(IS_PARSE_TEST){

    console.log(`____________________________________________________________`);
    console.log(`is test mode : ${IS_PARSE_TEST}`);

    if(err){
      spinner.fail();
      console.log(err);
    }

    return Promise.resolve(context);
  }

  // 글쓰기 - 하루에 하나만 쓰도록 PERMLINK를 고정
  let today = dateFormat(new Date(),'yyyy-mm-dd');
  
  // 글쓰기 이력 정보 확인
  let cont;
  if(!err){
    spinner = ora().start('check content is exist');
    let permlink = `${account}-${today}`;
    permlink = permlink.replace(/\./gi, '-'); // permlink에는 .이 포함되면 안됨에 유의
    permlink = permlink.replace(/\_/gi, '-'); // permlink에는 _이 포함되면 안됨에 유의
    context.parentLink = `https://steemit.com/${DEFAULT_TAG}/@${account}/${permlink}`;
    [err, cont] = await to(steem.api.getContentAsync(account, permlink));
    if(!err){
      spinner.succeed();
    }
  }

  // 글쓰기
  if(!err && cont && cont.id==0){
    
    // 비지로 작성하고 싶은 경우는 아래 구문의 주석을 해제하면 된다.
    // let jsonMetadata = {
    //   community:"busy",
    //   app:"busy/2.5.4",
    //   format:"markdown",
    //   tags:['kr-scrap','busy']
    // };
    let jsonMetadata = {
      app:"steemit/0.1",
      format:"markdown",
      tags:[ DEFAULT_TAG ]
    };

    spinner = ora().start('write content');
    let title = `${account}의 ${today} 이것저것 스크랩`;
    let body = `### ${today} 기준 스크랩 된 목록을 공유합니다.\n\n자세한 내용은 댓글을 참조 바랍니다.`;
    let permlink = `${account}-${today}`;
    permlink = permlink.replace(/\./gi, '-'); // permlink에는 .이 포함되면 안됨에 유의
    permlink = permlink.replace(/\_/gi, '-'); // permlink에는 _이 포함되면 안됨에 유의
    permlink = permlink.replace(/\+/gi, '-');
    permlink = permlink.replace(/\#/gi, '-');
    permlink = permlink.replace(/\=/gi, '-');
    permlink = permlink.replace(/\&/gi, '-');

    // 설정 값에 STEEM_AUTHOR 가 존재하면 해당 계정으로 베니피셔리(수익자)를 설정한다. 수익은 스팀파워로 수령하게 됨
    if(STEEM_AUTHOR){
      let beneficiaries = [
        /* weight : 10000 => 100% */
        { account: STEEM_AUTHOR, weight: 10000 }
      ];
      const operations = [
        ['comment',
            {
              parent_author: '',
              parent_permlink: DEFAULT_TAG,
              author: account,
              permlink:permlink,
              title: title,
              body: body,
              json_metadata: JSON.stringify(jsonMetadata)
            }
        ],
        ['comment_options', {
            author: account,
            permlink:permlink,
            max_accepted_payout: '1000000.000 SBD',
            percent_steem_dollars: 10000,
            allow_votes: true,
            allow_curation_rewards: true,
            extensions: [
                [0, {
                    beneficiaries: beneficiaries
                }]
            ]
        }]
      ];
      [err, cont] = await to(steem.broadcast.sendAsync({ operations, extensions: [] }, { posting: wif }));
    }else{
      [err, cont] = await to(steem.broadcast.commentAsync(wif, '', DEFAULT_TAG, account, permlink, title, body, JSON.stringify(jsonMetadata) ));  
    }
    
    if(!err){
      // 20초간 대기를 수행한다. 글 쓴 이후 댓글을 20초 이후 작성 가능
      await sleep(20000); 
      spinner.succeed();
    }
  }

  // 댓글쓰기
  if(!err){
    let image = `https://steemitimages.com/300x0/${context.image}`;
    let jsonMetadata = {
      app:"steemit/0.1",
      format:"markdown",
      tags:context.tags,
      image:[image],
      links:[context.url]
    };
    let body = [];
    body.push(`<img src='${image}' />`);
    body.push(`#### [${context.title}](${context.url})`);
    body.push(`> <i>${context.body}</i>`);
    body.push(`<i>from : ${getHostAddr(link)}</i>`);

    spinner = ora().start('write reply');
    let parentPermlink = `${account}-${today}`;
    parentPermlink = parentPermlink.replace(/\./gi, '-'); 

    // permlink에는 .이 포함되면 안됨에 유의
    // permlink에는 대문자가 포함되면 안됨에 유의
    let permlink = `${account}-${today}-${context.unique}`;
    permlink = permlink.replace(/\./gi, '-').toLowerCase();
    permlink = permlink.replace(/\_/gi, '-').toLowerCase();
    permlink = permlink.replace(/\+/gi, '-').toLowerCase();
    permlink = permlink.replace(/\#/gi, '-').toLowerCase();
    permlink = permlink.replace(/\=/gi, '-').toLowerCase();
    permlink = permlink.replace(/\&/gi, '-').toLowerCase();

    [err, cont] = await to(steem.broadcast.commentAsync(wif, account, parentPermlink, account, permlink, '', body.join('\n\n'), JSON.stringify(jsonMetadata) ));
    if(!err){
      spinner.succeed();
    }
  }

  // 글쓰기
  if(!err){
    return Promise.resolve(context);
  }

  // 오류처리
  if(err){
    spinner.fail();
    return Promise.reject(err.toString());
  }
}

module.exports = (args)=>{

  // 파라미터 초기화
  args = initParams(args);

  // 입력 파라미터 유효성 검증 
  if(args.length<1){
    console.error('\n    [경고] 파라미터 오류  : 아래 메뉴얼을 참조 바랍니다');
    help('scrappost');
    return; 
  }

  let link = args[0];       // 스크랩 할 포스팅
  let account = args[1];    // 계정명 
  let wif = args[2];        // 포스팅키

  processAsyc(link, account, wif)
  .then(res=>{

    // 처리 정보를 화면에 출력한다
    console.log(`____________________________________________________________`);
    console.log(res);
    console.log(`____________________________________________________________`);
  })
  .catch(e=>{
    console.log(`____________________________________________________________`);
    console.error(e);
    console.log(`____________________________________________________________`);
    console.error('오류가 발생 했습니다.위쪽 라인을 참조 바랍니다.');
    console.log(`____________________________________________________________`);
  });
};