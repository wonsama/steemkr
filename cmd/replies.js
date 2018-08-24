/*
* https://steemit.com/development/@wonsama/dev-get-all-replies-from-context
*/
const help = require('./help');
const {to} = require('../util/wutil');
const {getInfoFromLink} = require('../util/wutil');
const {getLocalTime} = require('../util/wdate');

const steem = require('steem');
const dateFormat = require('dateformat');
const ora = require('ora');

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

/*
* 댓글 목록 정보를 수신한다
* @param author 작가
* @param permlink 영구 주소
* @param output 출력정보
* @return 댓글 목록
*/
async function getReplies(author, permlink, output=[]){
    
    let children = [];
    let [err,items] = await to(steem.api.getContentRepliesAsync(author, permlink));
    
    if(err){
    	return Promise.reject(err);
    }else{
    	for(let item of items){
        output.push(item);
        if(item.children!=0){
            item.c = [];
            children.push(getReplies(item.author, item.permlink, item.c));
        }
    	}
    }

    // 한번에 모든 하위 댓글 정보를 읽어들인다.
    await Promise.all(children);
    
    return Promise.resolve(output);
}

/*
* 결과목록 정보를 화면상에 출력한다
* @param res 목록
* @param id 필터링하여 보여줄 아이디 정보(undefiend 인 경우에는 모두 출력한다)
*/
function rePrint(res, id){
    
		// sort by date asc
		res.sort((a,b)=>{
        let gap = a.depth - b.depth;
        if(gap==0){
            return new Date(a.created).getTime() - new Date(b.created).getTime();
        }else{
            return gap;
        }
    });

		// 10 단계 이상의 댓글은 그냥 숫자로 표현하자 -__-
    const FLAGS = ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣', '🔟' ];

		// print result recursivly
		let r;
    for(r of res){
    		
    		// let mark = `${FLAGS[r.depth-1]}`.padStart(r.depth*3);
    		let mark = `${FLAGS[r.depth-1]}`;

    		if(!id){
    			if(r.depth==1){
	    			console.log(`\n🔘⚪️🔘⚪️🔘⚪️🔘⚪️🔘⚪️🔘⚪️🔘⚪️🔘⚪️🔘⚪️🔘⚪️🔘⚪️🔘⚪️🔘⚪️🔘⚪️🔘⚪️🔘⚪️🔘⚪️🔘⚪️🔘⚪️🔘⚪️🔘⚪️🔘⚪️\n`);
	    		}else{
	    			console.log(``);
	    		}
    			console.log(
	        	mark, 
	        	` @${r.author}`, 
	        	`( ${dateFormat(getLocalTime(r.created), 'yyyy-mm-dd HH:MM:ss')} ) `, 
	        	`https://steemit.com${r.url}`,
	        	'\n\n',
	        	r.body,
	        	'\n'
					);
    		}else{
    			if(r.author.indexOf(id)>=0){
    				console.log(
		        	mark, 
		        	` @${r.author}`, 
		        	`( ${dateFormat(getLocalTime(r.created), 'yyyy-mm-dd HH:MM:ss')} ) `, 
		        	`https://steemit.com${r.url}`,
		        	'\n\n',
		        	r.body,
		        	'\n'
						);
    			}
    		}
        
        if(r.c){
            rePrint(r.c, id);
        }
    }
    // console.log(r);
}


/*
* 비동기 작업을 수행한다
* @url 입력받은 주소정보
*/ 
async function processAsyc(url){

	let err;

	let d = getInfoFromLink(url);
	if(!d.ok){
		err = `check url input info : ${url} `;
	}

	// 데이터 로딩
	let data;
	let spinner = ora().start('loading data');
	if(!err){
		[err, data] = await to(getReplies(d.data.author, d.data.permlink));
	}

	if(!err){
		// console.log(11111111);
		spinner.succeed();
		return Promise.resolve(data);
	}

  // 오류 처리
  if(err){
  	if(spinner.isSpinning){
  		spinner.fail();	
  	}
    return Promise.reject(err.toString());
  }
}

module.exports = (args)=>{

  // 파라미터 초기화
	args = initParams(args);

	// 입력 파라미터 유효성 검증 
	if(args.length<1){
		console.error('\n    [경고] 파라미터 오류  : 아래 메뉴얼을 참조 바랍니다');
		help('replies');
		return;	
	}

	let url = args[0];
	let id = args[1];

	processAsyc(url)
	.then(data=>{
		rePrint(data, id);
	})
	.catch(e=>{
		console.log(`____________________________________________________________`);
		console.error(e);
		console.log(`____________________________________________________________`);
		console.error('오류가 발생 했습니다.위쪽 라인을 참조 바랍니다.');
		console.log(`____________________________________________________________`);
	});
};