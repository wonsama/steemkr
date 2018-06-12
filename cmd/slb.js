const steem = require('steem');
const dateFormat = require('dateformat');
const asciichart = require ('asciichart');
const ora = require('ora');

// 배열 값을 갯수만큼 초기화 해준다
function initArray(cnt, val=0){
	let arr = [];
	for(let i=0;i<cnt;i++){
		arr[i] = val;
	}
	return arr;
}

// 시간을 연산한다 
// h : 시간 
Date.prototype.addHours = function(h) {
    this.setTime(this.getTime() + (h * 60 * 60 * 1000));
    return this;
}

// created 정보를 Date로 변환 => 한국 +9
// created : 생성시간 
function getLocalTime(created){
    created = created.replace("T", " ")
    var t = new Date(created).addHours(9);
    return t;
}

// 이전 날짜를 확인한다
// day : 몇일전
// startWithZero : 00:00:00 일 부터 시작할지 여부
function getBeforeDate(day, startWithZero=true){
	var date = new Date();
	date.setDate(date.getDate() - day);
	if(startWithZero){
		date.setHours(0);
		date.setMinutes(0);
		date.setSeconds(0);
	}
	return date;
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
	let timeEnd = new Date();
	let timeGap = Math.floor((timeEnd.getTime() - timeStart.getTime()) / 1000);
	let infos = [];
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
	
	console.log(`시간 상세 : ( 1st : ${getTime(hourBlocksSort[0])}, 2nd : ${getTime(hourBlocksSort[1])}, 3rd : ${getTime(hourBlocksSort[2])})`);
	console.log(hours.join(', ')) ;
}


module.exports = (args)=>{

	let slbAccount = args[0];
	let slbDays = args[1]?args[1]:7;	// 기본 7일

	// 입력 파라미터 유효성 검증 
	if(!args || args.length==0){
		// 기본 값 존재여부 확인
		if(DEF_AUTHOR){
			args = []; args.push(DEF_AUTHOR);
		}else{
			console.error('\n    [경고] 파라미터 오류  : 아래 메뉴얼을 참조 바랍니다');
			help('slb');
			return;	
		}
	}
	
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

};