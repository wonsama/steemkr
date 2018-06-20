const help = require('./help');
const {getLocalTime} = require('../util/wdate');
const {getMoney} = require('../util/wsteem');

const steem = require('steem');
const dateFormat = require('dateformat');
const ora = require('ora');

// 기본값
const STEEM_AUTHOR = process.env.STEEM_AUTHOR;
const STEEM_KEY_POSTING = process.env.STEEM_KEY_POSTING;

let total_vesting_shares;
let total_vesting_fund_steem;
let spinner;

function analysis(result){

	// console.log(result)

	let profile = undefined;
	try{
		profile = JSON.parse(result.json_metadata);
		profile=profile?profile.profile:undefined;
	}catch(e){}
	let profile_image = profile?profile.profile_image:undefined;
	let profile_name = profile?profile.name:undefined;
	let profile_about = profile?profile.about:undefined;
	let profile_location = profile?profile.location:undefined;

	let reputation = steem.formatter.reputation(result.reputation); // reputation
  let vesting_shares = getMoney(result.vesting_shares); // vest
  let received_vesting_shares = getMoney(result.received_vesting_shares); // vest
  let delegated_vesting_shares = getMoney(result.delegated_vesting_shares); // vest

  vesting_shares = vesting_shares + received_vesting_shares - delegated_vesting_shares;
  vesting_shares = steem.formatter.vestToSteem(vesting_shares, total_vesting_shares, total_vesting_fund_steem);
  vesting_shares = Math.round(vesting_shares);

	received_vesting_shares = steem.formatter.vestToSteem(received_vesting_shares, total_vesting_shares, total_vesting_fund_steem);
  received_vesting_shares = Math.round(received_vesting_shares);

  delegated_vesting_shares = steem.formatter.vestToSteem(delegated_vesting_shares, total_vesting_shares, total_vesting_fund_steem);
  delegated_vesting_shares = Math.round(delegated_vesting_shares);  

  let reward_sp = steem.formatter.vestToSteem(getMoney(result.reward_vesting_balance), total_vesting_shares, total_vesting_fund_steem);
  reward_sp = reward_sp.toPrecision(4);

	return [
		{
			en : 'profile',
			kr : '프로필',
			values : [
				{val : result.id, en : 'id', kr : '아이디'},
				{val : result.name, en : 'author', kr : '이름'},
				{val : profile_image, en : 'image', kr : '프로필사진'},
				{val : profile_name, en : 'name', kr : '닉네임'},
				{val : profile_about, en : 'about', kr : '정보'},
				{val : profile_location, en : 'location', kr : '사는곳'},
				{val : dateFormat(getLocalTime(result.created), 'yyyy-mm-dd HH:MM:ss'), en : 'location', kr : '계정생성일'},
				
			]
		},
		{
			en : 'vote',
			kr : '투표',
			values : [
				{val : reputation, en : 'reputation', kr : '명성'},
				{val : vesting_shares, en : 'vesting_shares', kr : '스파', subfix:'SP'},
				{val : received_vesting_shares, en : 'received_vesting_shares', kr : '스파(임차)', subfix:'SP'},
				{val : delegated_vesting_shares, en : 'delegated_vesting_shares', kr : '스파(임대)', subfix:'SP'},
				{val : result.voting_power/100, en : 'voting_power', kr : '보팅파워', subfix:'%'},
				{val : dateFormat(getLocalTime(result.last_vote_time), 'yyyy-mm-dd HH:MM:ss'), en : 'last_vote_time', kr : '최근투표일'},
			]
		},
		{
			en : 'money',
			kr : '잔고',
			values : [
				{val : getMoney(result.balance), en : 'balance', kr : '스팀', subfix:'STEEM'},
				{val : getMoney(result.sbd_balance), en : 'sbd_balance', kr : '스달', subfix:'SBD'}
			]
		},
		{
			en : 'reward',
			kr : '보상',
			values : [
				{val : getMoney(result.reward_sbd_balance), en : 'reward_sbd_balance', kr : '스달', subfix:'SBD'},
				{val : getMoney(result.reward_steem_balance), en : 'reward_steem_balance', kr : '스팀', subfix:'STEEM'},
				{val : getMoney(result.reward_vesting_balance), en : 'reward_vesting_balance', kr : '베스트', subfix:'VEST'},
				{val : reward_sp, en : 'reward_vesting_balance', kr : '스파', subfix:'SP'}
			]
		}
	];	
}

/*
* 보상을 요청한다
* @param results 결과정보
* @param author 저자 
* @param posting 포스팅키 
*/
function claimRewards(results, author, posting){

	// 요청 정보가 본인이며 기본 설정값이 존재하는지 확인 
	if(results.length==1 && results[0].name==author && posting!=undefined){

		let reward_steem_balance = results[0].reward_steem_balance;
    let reward_sbd_balance = results[0].reward_sbd_balance;
    let reward_vesting_balance = results[0].reward_vesting_balance;

		let r1 = Number(reward_steem_balance.split(" ")[0]);
    let r2 = Number(reward_sbd_balance.split(" ")[0]);
    let r3 = Number(reward_vesting_balance.split(" ")[0]);

    if (r1 == 0 && r2 == 0 && r3 == 0) {
			return Promise.resolve(`${author} no claim`);
    }else{
    	spinner.start('claim reward');
    	return steem.broadcast.claimRewardBalanceAsync(posting, author, reward_steem_balance, reward_sbd_balance, reward_vesting_balance);
    }
	}
	return Promise.resolve('no claim');
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

	// 2번째 : 포스팅키 
	if(args.length==1){
		if(STEEM_KEY_POSTING){
			args.push(STEEM_KEY_POSTING);
		}
	}

	return args;
}

module.exports = (args)=>{

  // 파라미터 초기화
	args = initParams(args);

	// 입력 파라미터 유효성 검증 
	if(args.length!=1 && args.length!=2){
		console.error('\n    [경고] 파라미터 오류  : 아래 메뉴얼을 참조 바랍니다');
		help('accounts');
		return;	
	}

	// (STEEM) 스피너 동작
	spinner = ora().start('load properties');

	// 글로벌 설정 값 로드 
	steem.api.getDynamicGlobalPropertiesAsync().then(result=>{
			
		spinner.succeed('load properties - success');

    total_vesting_shares = getMoney(result.total_vesting_shares);
    total_vesting_fund_steem = getMoney(result.total_vesting_fund_steem);

    spinner.start('load accounts');
    // (STEEM) 계정 목록 정보 로드
    return steem.api.getAccountsAsync(args);
    
	}).catch(e=>{
		// spinner.stop();
		spinner.fail('load properties - fail');
		console.error(`load properties - fail : `, e);
	}).then(results=>{

		spinner.succeed('load accounts - success\n');

		// 로드된 계정 목록 값 분석 
		for(let result of results){
			let groups = analysis(result);
			for(let g of groups){
				console.log(`===== ${g.kr} (${g.en}) =====\n`);
				for(let v of g.values){
					console.log(`${v.kr}(${v.en}) : ${v.val?v.val:(v.subfix?0:'N/A')} ${v.subfix?v.subfix:''}`);
				}
				console.log(``);
			}
		}

		// 보상을 요청한다
		return claimRewards(results, STEEM_AUTHOR, STEEM_KEY_POSTING);

	}).catch(e=>{
		spinner.fail('load accounts - fail');
		console.error(`load accounts - fail : `, e);
	}).then(result=>{
		if(spinner.isSpinning){
			spinner.succeed('claim reward - success\n');	
		}
	}).catch(e=>{
		spinner.fail('claim reward - fail');
		console.error(`claim reward - fail : `, e);
	})
};