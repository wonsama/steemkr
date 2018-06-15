const steem = require('steem');
const ora = require('ora');
const dateFormat = require('dateformat');

// 기본값
const DEF_AUTHOR = process.env.STEEM_AUTHOR;

// 누가 날 차단했는지 확인
// account : 계정
// startFollower : 조회 시작 계정명
// total : 조회된 계정 정보 
async function whoBlockMe(account, startFollower=null, total=[]) {

    const READ_COUNT = 999; // max read 999

    let results = await steem.api.getFollowersAsync(account, startFollower, null, READ_COUNT);
    startFollower = results[results.length - 1].follower;
    for(let result of results){
    	if (result.what.length == 1 && result.what[0] == 'ignore') {
          total.push("@"+result.follower);
      }
    }

    // 추가 정보가 있는지 확인
    if (results.length == READ_COUNT) {
    	return whoBlockMe(account, startFollower, total);
    }

    return total;
}

module.exports = (args) => {

		// 입력 파라미터 유효성 검증 
	if(!args || args.length==0){
		// 기본 값 존재여부 확인
		if(DEF_AUTHOR){
			args = []; args.push(DEF_AUTHOR);
		}else{
			console.error('\n    [경고] 파라미터 오류  : 아래 메뉴얼을 참조 바랍니다');
			help('feed');
			return;	
		}
	}

	let author = args[0];

  let timeStart = new Date();
  let spinner = ora().start('read');

  whoBlockMe(author)
  .then(results=>{

    let timeEnd = new Date();
    let timeGap = Math.floor((timeEnd.getTime() - timeStart.getTime()) / 1000);
    spinner.succeed(`read end : ${dateFormat(timeEnd, 'yyyy-mm-dd HH:MM:ss')} ( elapsed time : ${timeGap} sec )`);

    console.log();
    console.log(`■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■`);
  	console.log(`총 ${results.length} 명이 ${author} 님을 차단 했습니다.`);
    console.log(`■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■`);
  	console.log(`${results.join(', ')} `);
    console.log(`■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■`);
    console.log(`님들 차단해제 부탁드려요 ㅜㅜ`);
  })
  .catch(e=>{
  	console.log(e);
  });
}