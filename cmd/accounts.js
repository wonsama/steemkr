const help = require('./help');
const {getLocalTime} = require('../util/wdate');
const {getMoney} = require('../util/wsteem');
const {to} = require('../util/wutil');
const {question} = require('../util/wutil');

const steem = require('steem');
const dateFormat = require('dateformat');
const ora = require('ora');
const axios = require('axios');

// 기본값
const STEEM_AUTHOR = process.env.STEEM_AUTHOR;
const STEEM_KEY_POSTING = process.env.STEEM_KEY_POSTING;

/*
* 계정 정보를 분석한다
* @param acc 계정정보 
* @param total_vesting_shares total vesting shares 
* @param total_vesting_fund_steem total fund steem 
* @return 분석된 json 정보
*/
function analysis(acc, total_vesting_shares, total_vesting_fund_steem){

	let profile = undefined;
	try{
		profile = JSON.parse(acc.json_metadata);
		profile=profile?profile.profile:undefined;
	}catch(e){}
	// let profile_image = profile?profile.profile_image:undefined;
	let profile_image = `https://steemitimages.com/u/${acc.name}/avatar`;
	let profile_name = profile?profile.name:undefined;
	let profile_about = profile?profile.about:undefined;
	let profile_location = profile?profile.location:undefined;

	let reputation = steem.formatter.reputation(acc.reputation); // reputation
  let vesting_shares = getMoney(acc.vesting_shares); // vest
  let received_vesting_shares = getMoney(acc.received_vesting_shares); // vest
  let delegated_vesting_shares = getMoney(acc.delegated_vesting_shares); // vest

  vesting_shares = vesting_shares + received_vesting_shares - delegated_vesting_shares;
  vesting_shares = steem.formatter.vestToSteem(vesting_shares, total_vesting_shares, total_vesting_fund_steem);
  vesting_shares = Math.round(vesting_shares);

	received_vesting_shares = steem.formatter.vestToSteem(received_vesting_shares, total_vesting_shares, total_vesting_fund_steem);
  received_vesting_shares = Math.round(received_vesting_shares);

  delegated_vesting_shares = steem.formatter.vestToSteem(delegated_vesting_shares, total_vesting_shares, total_vesting_fund_steem);
  delegated_vesting_shares = Math.round(delegated_vesting_shares);  

  let reward_sp = steem.formatter.vestToSteem(getMoney(acc.reward_vesting_balance), total_vesting_shares, total_vesting_fund_steem);
  reward_sp = reward_sp.toFixed(3);

	return [
		{
			en : 'profile',
			kr : '프로필',
			values : [
				{val : acc.id, en : 'id', kr : '아이디'},
				{val : acc.name, en : 'author', kr : '이름'},
				{val : profile_image, en : 'image', kr : '프로필사진'},
				{val : profile_name, en : 'name', kr : '닉네임'},
				{val : profile_about, en : 'about', kr : '정보'},
				{val : profile_location, en : 'location', kr : '사는곳'},
				{val : dateFormat(getLocalTime(acc.created), 'yyyy-mm-dd HH:MM:ss'), en : 'location', kr : '계정생성일'},
				
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
				{val : acc.voting_power/100, en : 'voting_power', kr : '보팅파워', subfix:'%'},
				{val : dateFormat(getLocalTime(acc.last_vote_time), 'yyyy-mm-dd HH:MM:ss'), en : 'last_vote_time', kr : '최근투표일'},
			]
		},
		{
			en : 'money',
			kr : '잔고',
			values : [
				{val : getMoney(acc.balance), en : 'balance', kr : '스팀', subfix:'STEEM'},
				{val : getMoney(acc.sbd_balance), en : 'sbd_balance', kr : '스달', subfix:'SBD'}
			]
		},
		{
			en : 'reward',
			kr : '보상',
			values : [
				{val : getMoney(acc.reward_sbd_balance), en : 'reward_sbd_balance', kr : '스달', subfix:'SBD'},
				{val : getMoney(acc.reward_steem_balance), en : 'reward_steem_balance', kr : '스팀', subfix:'STEEM'},
				{val : getMoney(acc.reward_vesting_balance), en : 'reward_vesting_balance', kr : '베스트', subfix:'VEST'},
				{val : reward_sp, en : 'reward_vesting_balance', kr : '스파', subfix:'SP'}
			]
		}
	];	
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

/*
* 비동기 작업을 수행한다
* @param account 계정명
* @param wif 포스팅키
*/ 
let spinner;
async function processAsyc(account, wif){

	const AXIOS_CONFIG = {
		  headers: {'user-agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/51.0.2704.103 Safari/537.36'}
		};

	// 오류처리용
  let err;

  // 글로벌 설정 값 로드 -*/-*/-*/-*/-*/-*/-*/-*/-*/-*/-*/-*/-*/-*/-*/-*/-*/
  let global;
  spinner = ora().start('loading global');
  [err, global] = await to(steem.api.getDynamicGlobalPropertiesAsync());  
  if(err){
    // 오류처리
    spinner.fail();
    return Promise.reject(err.toString());
  }
  spinner.succeed(' ');
  let total_vesting_shares = getMoney(global.total_vesting_shares);
	let total_vesting_fund_steem = getMoney(global.total_vesting_fund_steem);

	// 계정정보 확인 -*/-*/-*/-*/-*/-*/-*/-*/-*/-*/-*/-*/-*/-*/-*/-*/-*/
  let acc;
  spinner = ora().start('loading account');
  [err, acc] = await to(steem.api.getAccountsAsync([account]));  
  if(acc){
    if(acc.length!=1){
      // 오류처리
      spinner.fail();
      return Promise.reject(`입력하신 ${account} 정보를 확인 바랍니다.`);
    }
  }else{
    // 오류처리
    spinner.fail();
    return Promise.reject(err.toString());
  }
  acc = acc[0];
  spinner.succeed(' ');

  // 로드된 계정 값 분석 -*/-*/-*/-*/-*/-*/-*/-*/-*/-*/-*/-*/-*/-*/-*/-*/-*/
	let groups = analysis(acc, total_vesting_shares, total_vesting_fund_steem);
	for(let g of groups){
		console.log(`===== ${g.kr} (${g.en}) =====\n`);
		for(let v of g.values){
			console.log(`${v.kr}(${v.en}) : ${v.val?v.val:(v.subfix?0:'N/A')} ${v.subfix?v.subfix:''}`);
		}
		console.log(``);
	}

	// 팔로워 정보 확인 -*/-*/-*/-*/-*/-*/-*/-*/-*/-*/-*/-*/-*/-*/-*/-*/-*/
	let FOLLOW_API_URL = `https://steemdb.com/api/accounts?account=${account}`;
	let followers;
	spinner = ora().start('loading followers info');
	[err, followers] = await to(axios.get(FOLLOW_API_URL, AXIOS_CONFIG));
	if(err){
    // 오류처리
    spinner.fail();
    return Promise.reject(err.toString());
  }else if(!followers.data){
  	// 오류처리
    spinner.fail();
    return Promise.reject('팔로워 정보를 확인할 수 없습니다.');
  }
  spinner.succeed(' ');

  // 팔로워 정보 출력
  // mvest = 1 Million Vests
  // busy의 보팅을 받기 위해선 25 billion (250억) vest가 필요
  let finfo = followers.data[0];
	console.log('===== 팔로워 (followers) =====\n');
	console.log(`팔로잉 : ${finfo.following_count} 명`);
	console.log(`팔로워 : ${finfo.followers_count} 명`);
	console.log(`팔로워 MVEST : ${finfo.followers_mvest.toLocaleString()}`);
  console.log(`( DB스냅샷(steemdb.com) 기준이라 약간차이가 있을 수 있음 )`);
  console.log(``);

	// 스파 임차정보 확인 -*/-*/-*/-*/-*/-*/-*/-*/-*/-*/-*/-*/-*/-*/-*/-*/-*/
	if(getMoney(acc.received_vesting_shares)>0){

		let DELEGATORS_API_URL = `https://happyukgo.com/api/steemit/delegators/?id=${account}&hash=3535ffa23344c25d2dcdc991fbdb60a5&_=`+new Date().getTime();
		let delegators;
		spinner = ora().start('loading delegator');
		[err, delegators] = await to(axios.get(DELEGATORS_API_URL, AXIOS_CONFIG));
		if(err){
	    // 오류처리
	    spinner.fail();
	    return Promise.reject(err.toString());
	  }else if(!delegators.data){
	  	// 오류처리
	    spinner.fail();
	    return Promise.reject('임차 정보를 확인할 수 없습니다.');
	  }
	  spinner.succeed(' ');

		// 임차 스파정보 출력
	  console.log('===== 임차 (delegators) =====\n');
	  for(let de of delegators.data){
	  	let de_sp = de.sp.toFixed(0);
	  	console.log(`임대받은 아이디 : ${de.delegator}, 날짜 : ${de.time}, 스파 : ${de_sp} SP`);
	  }
	  console.log(``);
	}

	// 스파 임대정보 확인 -*/-*/-*/-*/-*/-*/-*/-*/-*/-*/-*/-*/-*/-*/-*/-*/-*/
	if(getMoney(acc.delegated_vesting_shares)>0){
		let delegatee;
		spinner = ora().start('loading delegatee');
	  [err, delegatee] = await to(steem.api.getVestingDelegationsAsync(account, null, 1000));  
	  if(err){
	    // 오류처리
	    spinner.fail();
	    return Promise.reject(err.toString());
	  }
	  spinner.succeed(' ');
	  
	  // 임대 스파정보 출력
	  console.log('===== 임대 (delegatee) =====\n');
	  for(let de of delegatee){
	  	let de_date = dateFormat(getLocalTime(de.min_delegation_time),'yyyy-mm-dd HH:MM:ss');
	  	let de_sp = steem.formatter.vestToSteem(getMoney(de.vesting_shares), total_vesting_shares, total_vesting_fund_steem).toFixed(0);
	  	console.log(`임대해준 아이디 : ${de.delegatee}, 날짜 : ${de_date}, 스파 : ${de_sp} SP`);
	  }
	  console.log(``);
	}
	
	// 보상청구 -*/-*/-*/-*/-*/-*/-*/-*/-*/-*/-*/-*/-*/-*/-*/-*/-*/
	// 설정값 계정 일치 & 포스팅키 및 보상이 존재하는 경우 요청한다
	if(STEEM_AUTHOR==account && wif){
		let reward_steem_balance = acc.reward_steem_balance;
    let reward_sbd_balance = acc.reward_sbd_balance;
    let reward_vesting_balance = acc.reward_vesting_balance;

		let r1 = getMoney(reward_steem_balance);
    let r2 = getMoney(reward_sbd_balance);
    let r3 = getMoney(reward_vesting_balance);

    if(r1+r2+r3>0){
    	let claim;
		  spinner = ora().start('claim reward');
		  [err, claim] = await to(steem.broadcast.claimRewardBalanceAsync(wif, account, reward_steem_balance, reward_sbd_balance, reward_vesting_balance));  
		  if(err){
		    // 오류처리
		    spinner.fail();
		    return Promise.reject(err.toString());
		  }
		  spinner.succeed(' ');
    }
	}

	// 결과 확인
  return Promise.resolve(`${account} 님의 계정정보 분석이 완료 되었습니다.`);
}

module.exports = (args)=>{

  // 파라미터 초기화
	args = initParams(args);

	// 입력 파라미터 유효성 검증 
	if(args.length<1){
		console.error('\n    [경고] 파라미터 오류  : 아래 메뉴얼을 참조 바랍니다');
		help('accounts');
		return;	
	}

	let account = args[0];
	let wif = args[1];

	processAsyc(account, wif)
	.then(message=>{
		console.log(message);
	})
	.catch(e=>{
		console.log(`____________________________________________________________`);
		console.error(e);
		console.log(`____________________________________________________________`);
		console.error('오류가 발생 했습니다.위쪽 라인을 참조 바랍니다.');
		console.log(`____________________________________________________________`);
	});
};