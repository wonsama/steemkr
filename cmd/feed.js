const help = require('./help');
const {getLocalTime} = require ('../util/wdate');
const {error} = require ('../util/error');

const steem = require('steem');
const ora = require('ora');
const dateFormat = require('dateformat');

const RELOAD_TIME = 1000 * 10;
const READ_CONTENTS_MAX = 100;
const READ_COUNTS = 20;	// 1 ~ 100

// 기본값
const STEEM_AUTHOR = process.env.STEEM_AUTHOR;

let READ_CONTENTS = [];

/*
* 피드 정보를 읽어들인다
*/
let loadFeed = (author, limit, showReblog=true) =>{

	let timeStart = new Date();
	let spinner = ora().start('reload');

	steem.api.getDiscussionsByFeedAsync({tag:author, limit:limit})
	.then(results=>{

		let timeEnd = new Date();
		let timeGap = Math.floor((timeEnd.getTime() - timeStart.getTime()) / 1000);
		spinner.succeed(`reload end : ${dateFormat(timeEnd, 'yyyy-mm-dd HH:MM:ss')} ( elapsed time : ${timeGap} sec )`);

		let PRINTS = [];

		for(let result of results){
			// 기존에 읽어들인 컨텐츠인가를 확인 
			let authorperm = `${result.author}${result.permlink}`;

			// 고유한 링크정보 
			if(!READ_CONTENTS.includes(authorperm)){

				// 리블로그를 보여줄지 선택
				if(showReblog || result.reblogged_by.length==0){

					// 읽어들인 컨텐트에 기록 
					READ_CONTENTS.push(authorperm);

					// 출력물에 저장
					PRINTS.push(result);

					// 저장소 크기 유지
					if(READ_CONTENTS.length>READ_CONTENTS_MAX){
						READ_CONTENTS = READ_CONTENTS.shift();
					}
				}

			}
		}

		// 시간 역순 정렬, 리블로그는 첫 리블로그 시간을 기준으로 함
		PRINTS.sort((a,b)=>{
			let ta = a.first_reblogged_on?getLocalTime(a.first_reblogged_on).getTime():getLocalTime(a.created).getTime();
			let tb = b.first_reblogged_on?getLocalTime(b.first_reblogged_on).getTime():getLocalTime(b.created).getTime();

			return ta - tb;
		});

		// 출력
		for(let p of PRINTS){
			// console.log(p);

			let d = getLocalTime(p.created);
			let fr = getLocalTime(p.first_reblogged_on);
			let tags = [];
			try{
				let _json = JSON.parse(p.json_metadata);
				tags = _json.tags;
			}catch(e){tags=[];}

			console.log();
			console.log(`■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■`);
			console.log(`⚡️ 제목 : ${p.title}`);
			if( p.reblogged_by.length > 0 ){
				console.log(`⚡️ 작성일 : ${dateFormat(d,'mm/dd HH:MM:ss')} 🌹 리블로그 : ${p.reblogged_by.join(", ")} (${dateFormat(fr,'mm/dd HH:MM:ss')}) ` ) ;
			}else{
				console.log(`⚡️ 작성일 : ${dateFormat(d,'mm/dd HH:MM:ss')}` ) ;
			}
			
			console.log(`⚡️ 링크 : https://steemit.com/${p.category}/@${p.author}/${p.permlink}`);
			console.log(`⚡️ 태그 : ${tags.join(", ")}`);
			console.log(`■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■`);
			console.log(p.body.substr(0,200));
			console.log();
			// console.log(p)
		}

		// RELOAD_TIME 이후 다시 컨텐츠를 읽어들인다.
		setTimeout(()=>{loadFeed(author, limit, showReblog)}, RELOAD_TIME);
	})
	.catch(e=>{

		// 오류 발생 시 컨텐츠를 다시 읽어 들인다.
		spinner.fail(`load fail reload contents at ${dateFormat(new Date(),'mm/dd HH:MM:ss')} - ${e.toString()}`);

		// RELOAD_TIME 이후 다시 컨텐츠를 읽어들인다.
		setTimeout(()=>{loadFeed(author, limit, showReblog)}, RELOAD_TIME);
	})	
}

/*
* 파라미터 정보를 초기화 해준다
* @param args 외부로부터 입력받은 파라미터 
*/
function initParams(args)
{
	// 초기화
	args = args?args:[];  // new 처리 하므로 return 처리 해야 됨에 유의

	// 1번째 : 작가
	if(args.length==0){
		if(STEEM_AUTHOR){
			args.push(STEEM_AUTHOR);
		}
	}

	// 2번째 : 리블로그 표시여부
	if(args.length==1){
		// 기본값으로 true를 설정
		args.push(true);
	}

	return args;
}

module.exports = (args)=>{

	// 파라미터 초기화
	args = initParams(args);

	// 입력 파라미터 유효성 검증 
	if(args.length!=2){
		console.error('\n    [경고] 파라미터 오류  : 아래 메뉴얼을 참조 바랍니다');
		help('feed');
		return;
	}

	let author = args[0];
	let showReblog = args[1];	// hidden params - default : true

	loadFeed( author, READ_COUNTS, showReblog );
};