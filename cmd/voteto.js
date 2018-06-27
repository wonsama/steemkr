const help = require('./help');

const {getLocalTime} = require('../util/wdate');
const {getBeforeDate} = require('../util/wdate');

const {to} = require('../util/wutil');
const {sortByKey} = require('../util/wutil');
const {getTop} = require('../util/wutil');

const {getMoney} = require('../util/wsteem');

const steem = require('steem');
const ora = require('ora');
const dateFormat = require('dateformat');

// 기본값
const STEEM_AUTHOR = process.env.STEEM_AUTHOR;
const STEEM_VOTE_DAY = process.env.STEEM_VOTE_DAY;

const DEF_SEARCH_DAYS = 7;

/*
* 파라미터 정보를 초기화 해준다
* @param args 외부로부터 입력받은 파라미터 
*/
function initParams(args)
{
	// 초기화
	args = args?args:[];	// new 처리 하므로 return 처리 해야 됨에 유의

	// 1번째 : 작가
	if(args.length==0){
		if(STEEM_AUTHOR){
			args = [];
			args.push(STEEM_AUTHOR);
		}
	}

	// 2번째 : 날짜
	if(args.length==1){
    if(STEEM_VOTE_DAY){
      args.push(STEEM_VOTE_DAY);
    }else{
      args.push(DEF_SEARCH_DAYS);  
    }
	}

	return args;
}

/*
* 비동기 작업을 수행한다
* @param account 계정명
* @param days 조회 일자
*/ 
let spinner;
async function processAsyc(account, days){

	// 오류처리용
  let err;

  /* item
      { authorperm: 'lucky2/2fexgq',
        weight: 317,
        rshares: 1314663102,
        percent: 10000,
        time: '2018-06-26T06:26:57' }
  */
  // 투표 정보 확인
  let votes;
  spinner = ora().start('loading votes');
  [err, votes] = await to(steem.api.getAccountVotesAsync(account));  
  if(err){
    // 오류처리
    spinner.fail();
    return Promise.reject(err.toString());
  }
  spinner.succeed(' ');

  // 투표 정보 - 정렬 / 최근것이 맨아래 보이도록 함
  votes.sort((a,b)=>{
    return getLocalTime(a.time).getTime() - getLocalTime(b.time).getTime();
  });

  // 투표 정보 - 기간 제한
  let beforeTime = getBeforeDate(days).getTime();
  let f_votes = votes.filter(a=>getLocalTime(a.time).getTime() > beforeTime);

  // 투표한 글 정보 가져오기
  let con_infos = [];
  for(let fv of f_votes){
    let link = fv.authorperm.split('/');
    con_infos.push( steem.api.getContentAsync(link[0], link[1]) );
  }
  let cinfos;
  spinner = ora().start('loading ori contents info');
  [err, cinfos] = await to(Promise.all(con_infos));
  if(err){
    // 오류처리
    spinner.fail();
    return Promise.reject(err.toString());
  }
  spinner.succeed(' ');

  // 조회 정보 반환
  return Promise.resolve([f_votes, cinfos]);
}

module.exports = (args)=>{

	// 파라미터 초기화
	args = initParams(args);

	// 입력 파라미터 유효성 검증 
	if(args.length!=2){
		console.error('\n    [경고] 파라미터 오류  : 아래 메뉴얼을 참조 바랍니다');
		help('voteto');
		return;	
	}

	// 비동기 작업을 수행한다
	let account = args[0];
	let days = args[1];

	processAsyc(account, days)
	.then(result=>{
		let f_votes = result[0];
    let cinfos = result[1];

    let votes = {};
    let tvotes = 0;
    let svotes = 0;

    // 결과 목록 출력
    for(let i=0;i<cinfos.length;i++){
      let citem = cinfos[i];
      let fitem = f_votes[i];
      let url = `https://steemit.com` + citem.url;
      let p = fitem.percent;
      let percent = p==0?'( 보팅취소 )':`( ${fitem.percent/100} % )`;
      let t1 = getLocalTime(fitem.time);
      let t2 = getLocalTime(citem.created);
      let time1 = dateFormat(t1,'yyyy-mm-dd HH:MM:ss' );
      let time2 = dateFormat(t2,'yyyy-mm-dd HH:MM:ss' );
      let gap = Math.floor((t1.getTime() - t2.getTime())/1000/60)/60; // hour
      let self = account==citem.account?'🔥':'⭐️';
      
      if(p!=0){

        // 정보 출력
        console.log(`${self} ${citem.root_title}`);
        console.log(`[ 투표 시간 : ${time1} ] [ 글 작성일 : ${time2} ] [ GAP : ${gap.toFixed(2)} hour ]`);
        console.log( url );
        if(citem.pending_payout_value=='0.000 SBD'){
          // payout 지난 글
          let m = getMoney(citem.total_payout_value, citem.curator_payout_value);
          console.log(`보상완료 : ${m.toFixed(3)} SBD / 보팅 : ${citem.active_votes.length} ${percent}`);
        }else{
          // payout 이전 글
          console.log(`보상 전 : ${citem.pending_payout_value} / 보팅 : ${citem.active_votes.length} ${percent}`);   
        }
        
        console.log();

        // 투표정보 카운트
        votes[citem.author] = !votes[citem.author]?1:votes[citem.author]+1;
        tvotes++;
        if(account==citem.author){
          svotes++;
        } 
      }
    }
    
    // 투표 TOP 3 출력
    let top3 = getTop( sortByKey(votes) );
    console.log(`____________________________________________________________`);
    console.log(`${account}'s TOP 3 VOTES in ${days} days`);
    console.log(`____________________________________________________________`);
    for(let i=0;i<top3.n.length;i++){
      let pc = ((top3.n[i] / tvotes)*100*top3.v[i].length).toFixed(2);
      console.log( `${top3.n[i]} votes ( ${pc} % )  : ${top3.v[i].join(', ')}` );
    }
    console.log(`____________________________________________________________`);
    console.log(`total : ${tvotes} votes, self : ${svotes} votes ( ${((svotes/tvotes)*100).toFixed(2)} % ) `);
    console.log(`____________________________________________________________`);
	})
	.catch(e=>{
		console.log(`____________________________________________________________`);
		console.error(e);
		console.log(`____________________________________________________________`);
		console.error('조회가 실패 했습니다 - 조회 기간(7일 이하 추천)이 길거나 보팅 횟수가 많은 경우, 조회 기간을 줄여주세요');
		console.log(`____________________________________________________________`);
	});

};