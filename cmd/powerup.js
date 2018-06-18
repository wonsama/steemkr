/*
* see : https://nodejs.org/api/readline.html
*/
const steem = require('steem');
const readline = require('readline');
const ora = require('ora');

const STEEM_AUTHOR = process.env.STEEM_AUTHOR;
const STEEM_KEY_ACTIVE = process.env.STEEM_KEY_ACTIVE;
const DEFAULT_STEEM = '0.000 STEEM';

/*
* 잔고에서 요청할 스팀 파워 정보를 계산한다
* @param answer 요청정보
* @param balance 잔고
* @return 유효한 요청금액
*/
function getSteem(answer, balance){
	if(!answer){
		return DEFAULT_STEEM;
	}else if(answer.toUpperCase()=='ALL'){
		return balance;
	}else{
		try{
			return answer + " STEEM";
		}catch(e){
			return DEFAULT_STEEM;
		}
	}
}

module.exports = (args)=>{

	// 입력 파라미터 유효성 검증 
	if(!args || args.length==0){
		// 기본 값 존재여부 확인
		if(STEEM_AUTHOR){
			args = []; args.push(STEEM_AUTHOR);
			if(STEEM_KEY_ACTIVE){
				args.push(STEEM_KEY_ACTIVE);
			}
		}else{
			console.error('\n    [경고] 파라미터 오류  : 아래 메뉴얼을 참조 바랍니다');
			help('powerup');
			return;	
		}
	}
	if(args.length<2){
		console.error('\n    [경고] 파라미터 오류  : 아래 메뉴얼을 참조 바랍니다');
		help('powerup');
		return;	
	}

	let author = args[0];
	let activeKey = args[1];

	// 계정정보 및 엑티브 키 정보가 반드시 존재한다는 가정하에 아래 단계를 진행
	let spinner = ora().start(`@${author} 계정 정보 로딩`);
	steem.api.getAccountsAsync([author])
	.then(results=>{
		spinner.succeed(`@${author} 계정 정보 로딩 - 성공`);

		let balance = results[0].balance;
		if(balance==DEFAULT_STEEM){
			console.log('파워업 할 STEEM 이 존재하지 않습니다.');
		}else{
			// rl.question blocking이 아님에 유의 !!
			const rl = readline.createInterface({
			  input: process.stdin,
			  output: process.stdout
			});
			rl.question(`${balance} 중 몇 STEEM을 파워업에 사용하시겠습니까 x.xxx 형태로 입력 ( all 입력 시 모두 파워업 진행 ) ? `, (answer) => {

				let steempw = getSteem(answer, balance);
				let b_pw = Number(balance.split(' ')[0]);
				let s_pw = Number(steempw.split(' ')[0]);

				if(steempw!=DEFAULT_STEEM && b_pw>=s_pw){

					spinner = ora().start(`파워업( ${steempw} ) - 진행중`);
					steem.broadcast.transferToVestingAsync(activeKey, author, author, steempw)
					.then(sresults=>{
						spinner.succeed(`파워업( ${steempw} ) - 성공`);
						console.log('steemkr ac 명령을 사용하여 반영된 정보를 확인 바랍니다.');
					}).catch(se=>{
						spinner.fail('파워업 - 실패' + se);
					});
				}
			  rl.close();

			});
		}
	})
	.catch(e=>{
		spinner.fail('계정 정보 로딩 - 실패' + e);
	});
};