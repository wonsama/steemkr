const help = require('./help');
const {getBeforeDate} = require ('../util/wdate');
const {getLocalTime} = require ('../util/wdate');

const steem = require('steem');
const dateFormat = require('dateformat');
const asciichart = require ('asciichart');
const ora = require('ora');

const DEFAULT_DAY = 7;

// 기본값
const STEEM_AUTHOR = process.env.STEEM_AUTHOR;
const STEEM_SLB_DAY = process.env.STEEM_SLB_DAY;

// 배열 값을 갯수만큼 초기화 해준다
function initArray(cnt, val=0){
	let arr = [];
	for(let i=0;i<cnt;i++){
		arr[i] = val;
	}
	return arr;
}

// 글 구분
// op_item : 항목
// author : 글쓴이(나)
// return post(내가 쓴글), comments(답글-받은거), reply(댓글-쓴거)
function getTp(op_item, author){

	if(op_item.parent_author==''&&op_item.author==author){
		return 'post';
	}

	if(op_item.parent_author!=author && op_item.author==author){
		return 'reply';
	}else{
		return 'comment';
	};
}

// 중복 항목(수정건)이 아닌 경우에만 추가한다
// fitem : 추가 예정 아이템
// infos : 추가 예정 목록
function isNotDupItem(fitem, infos){

	for(let info of infos){
		if(fitem.p==info.p&&fitem.a==info.a){
			return false;
		}
	}
	
	return true;
}

// 스팀잇 라이프 벨런스
// 1day, 1week, 1month
async function loadSLB(account, day=7, ninfos=[], from=Number.MAX_SAFE_INTEGER, limit=1000){
	
	let timeStart = new Date();
	let spinner = ora().start('read histoy');

	let results = await steem.api.getAccountHistoryAsync(account, from, limit);
	// console.log(account, from, limit);
	let timeEnd = new Date();
	let timeGap = Math.floor((timeEnd.getTime() - timeStart.getTime()) / 1000);
	let infos = [];
	// console.log('results', results);
	let idxStart = results[0][0];	// low(옛날)
	
	let idxEnd = results[results.length-1][0];	// high(최신)

	spinner.succeed(`read histoy : ${idxStart} ~ ${idxEnd} ( elapsed time : ${timeGap} sec )`);

	for(let result of results){
		let item = result[1];
		let t = getLocalTime(item.timestamp);
		let op = item.op[0];
		let op_item = item.op[1];
		let tp = getTp(op_item, account)// post(내가 쓴글), comments(답글-받은거), reply(댓글-쓴거)

		if(op=='comment'){

			// 글 수정건은 (a+p 가 동일한 값) 넣지 않음.
			let fitem = {
						g:tp,	// 구분
						t:t,
						d:dateFormat(t,'yyyy-mm-dd HH:MM:ss'),
						h:dateFormat(t,'HH'),
						b:tp=='post'?op_item.title:op_item.body, 
						a:op_item.author,
						p:op_item.permlink
					}
			infos.push(fitem);
		}
	}

	// 정렬 : 최신것을 맨 앞으로 
	infos.sort((a,b)=>b.t-a.t);

	// 필터링 : 수정 글은 포함하지 않도록 함.(최신 수정된 글만 유지)
	for(let info of infos){
		if(isNotDupItem(info, ninfos)){
			ninfos.push(info);
		}
	}

	// 더 읽어야 되는지 여부를 확인함
	if(ninfos[ninfos.length-1].t.getTime() > getBeforeDate(day).getTime()){
		let readFrom = Math.max(0, idxStart-1);
		let readLimit = readFrom==0?idxStart:limit;
		return loadSLB(account, day, ninfos, readFrom, readLimit);
	}else{
		// 날짜 필터링
		ninfos = ninfos.filter(x=>x.t.getTime()>getBeforeDate(day).getTime()?true:false);	
		return ninfos;
	}
}

/*
* TOP3 시간 정보를 보여준다 
* @param hourBlocks 시간목록 정보
*/
function printBlockToTime(hourBlocks){

	let i = 0;
	let hours = [];
	for(let v of hourBlocks)
	{
		// let hour = i.toString().padStart(2, '0') + ' 시';
		if(v>0){
			hours.push(`${i}h: ${v}`);
		}
		i++;
	}

	let hourBlocksSort = hourBlocks.map((v,i)=>{
		return {v:v, t:i};
	})
	hourBlocksSort.sort((a,b)=>{
		return b.v - a.v;
	})


	function getTime(x){
		return `${x.t}h (${x.v})`;
	}
	
	console.log(`TOP 3 : ( 1st : ${getTime(hourBlocksSort[0])}, 2nd : ${getTime(hourBlocksSort[1])}, 3rd : ${getTime(hourBlocksSort[2])})`);
	// console.log(hours.join(', ')) ;
}


/*
* 차트를 그려준다
* @param command 명령
* @param results 데이터
*/
function drawChart(command, results){
		
	let hourBlocks = initArray(24);
	const ASCII_CONFIG = {
	    offset:  7,          // axis offset from the left (min 2)
	    padding: '     ',  // padding string for label formatting (can be overrided)
	    height:  10,         // any height you want	
	};

	let sum = 0;
	for(let result of results){
		if(result.g==command){
			let v = hourBlocks[Number(result.h)];
			v=v+1;
			sum=sum+1;
			hourBlocks[Number(result.h)]=v;
		}
	}

	console.log(`${command} total counts : ${sum}`);
	printBlockToTime(hourBlocks);
	console.log(asciichart.plot(hourBlocks, ASCII_CONFIG)+'\n');
}

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
		if(STEEM_SLB_DAY){
			args.push(STEEM_SLB_DAY);
		}else{
			args.push(DEFAULT_DAY);	// 기본 7일
		}
	}

	return args;
}

module.exports = (args)=>{

	// 파라미터 초기화
	args = initParams(args);

	// 입력 파라미터 유효성 검증 
	if(args.length!=2){
		console.error('\n    [경고] 파라미터 오류  : 아래 메뉴얼을 참조 바랍니다');
		help('slb');
		return;	
	}

	let slbAccount = args[0];
	let slbDays = args[1];
	
	loadSLB( slbAccount, slbDays)
	.then(results=>{

		console.log(`\n@${slbAccount} 의 최근 ${slbDays}일 간 steemit life balance.\n`);

		// draw chart
		drawChart('post', results);
		drawChart('reply', results);
		drawChart('comment', results);
	})
	.catch(e=>{
		console.error('error', e);
	});

};