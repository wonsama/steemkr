const help = require('./help');

const {getLocalTime} = require('../util/wdate');
const {to} = require('../util/wutil');
const {getInfoFromLink} = require('../util/wsteem');

const steem = require('steem');
const ora = require('ora');
const dateFormat = require('dateformat');

let spinner;
/*
* 비동기 작업을 수행한다
* @param url 조회하려는 스팀잇 URL 주소
*/ 
async function processAsync(url){

  // 주소 정보에서 author, permlink 추출
  let link = getInfoFromLink(url);
  if(!link.ok){
    return Promise.reject(link.msg);
  }

  let author = link.data.author;
  let permlink = link.data.permlink;

  // 글 정보 조회
  let cont;
  spinner = ora().start('loading content info');
  [err, cont] = await to(steem.api.getContentAsync(author, permlink));  
  if(err){
    // 오류처리
    spinner.fail();
    return Promise.reject(err.toString());
  }
  spinner.succeed(' ');

  // created, last_update 두개가 다르다면 수정 이력이 존재하다는 것임
  let created = cont.created;
  let last_update = cont.last_update;
  if(created==last_update){
    return Promise.reject(`${url}\n위 주소의 글은 수정 이력이 존재하지 않습니다.`);
  }

  // 계정 이력 정보에서 해당 글 정보를 검색 
  let from = -1;
  let limit = 1000;
  let history;
  let changes = [];
  let isNotFound = true;

  while(isNotFound){
    spinner = ora().start(`loading account history from ${from==-1?'lastest':from}`);
    [err, history] = await to(steem.api.getAccountHistoryAsync(author, from, limit));  
    if(err){
      // 오류처리
      spinner.fail();
      return Promise.reject(err.toString());
    }
    spinner.succeed(' ');
    
    for(let his of history){
      let op = his[1].op;
      let type = op[0]; // comment, vote, curation_reward, transfer ...
      let data = op[1];
      let timestamp = his[1].timestamp;
      if(type=='comment'){
        let pa = data.parent_author;
        let a = data.author;
        let p = data.permlink;

        if(pa=='' && a==author && p==permlink){

          let body = data.body;
          if(body.indexOf('@@')==0){
            // 수정글
            body = decodeURIComponent(body);
          }
          changes.push({
            title : data.title,
            body : body,
            timestamp : timestamp,
          });
          if(timestamp==created){
            isNotFound = false;
          }
        }
      }
    }

    // update from & limit
    if(isNotFound){
      from = history[0][0];
      if(from-limit<0){
        limit = from;
      } 
    }
  }

  // 정렬
  changes.sort((a,b)=>getLocalTime(a.timestamp).getTime() - getLocalTime(b.timestamp).getTime());
  
  return Promise.resolve(changes);
}

/*
* 파라미터 정보를 초기화 해준다
* @param args 외부로부터 입력받은 파라미터 
*/
function initParams(args)
{
  // 초기화
  args = args?args:[];  // new 처리 하므로 return 처리 해야 됨에 유의

  return args;
}

module.exports = (args)=>{

  // 파라미터 초기화
  args = initParams(args);

  // 입력 파라미터 유효성 검증 
  if(args.length!=1){
    console.error('\n    [경고] 파라미터 오류  : 아래 메뉴얼을 참조 바랍니다');
    help('history');
    return; 
  }

  // 비동기 작업을 수행한다
  let url = args[0];
  processAsync(url).then(changes=>{
  
    let idx = 0;
    for(let ch of changes){

      let time = dateFormat(getLocalTime(ch.timestamp), 'yyyy-mm-dd HH:MM:ss');

      console.log(`____________________________________________________________`);
      console.log(`시간 : [ ${idx} ] ${time}`);
      console.log(`____________________________________________________________`);
      console.log(`제목 : ${ch.title}`);
      console.log(`내용 : ${ch.body}`);
      console.log();
      idx++;
    }

    console.log(`____________________________________________________________`);
    console.log(`원본 글 주소 : ${url} / 총 ${idx-1} 번의 수정이 이뤄졌습니다.`);
    console.log(`____________________________________________________________`);
    console.log();

  }).catch(e=>{
    console.log(`____________________________________________________________`);
    console.error(e);
    console.log(`____________________________________________________________`);
  });
}