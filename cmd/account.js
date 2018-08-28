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
const AXIOS_CONFIG = {
  headers: {
    'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_13_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/67.0.3396.99 Safari/537.36',
    'accept':'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
    'accept-encoding': 'gzip, deflate, br',
    'accept-language': 'ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7'
  }
};

/*
* 파라미터 정보를 초기화 해준다
* @param args 외부로부터 입력받은 파라미터 
*/
let isAutoAuthor = false;
function initParams(args)
{
	// 초기화
	args = args?args:[];  // new 처리 하므로 return 처리 해야 됨에 유의

	// 1번째 : 작가
	if(args.length==0){
		if(STEEM_AUTHOR){
			args.push(STEEM_AUTHOR);
			isAutoAuthor = true;
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

/**
* 필요 정보를 읽어들인다.
* @param account 계정명
* @return 정보가 담긴 object
*/
let spinner;
async function loadingDatas(account){
	
	let err;

  const FOLLOW_API_URL = `https://steemdb.com/api/accounts?account=${account}`;


  // steemd 사이트가 가끔 오류날 경우가 있기 때문
  let results;
  spinner = ora().start('loading data');
  [err,results] = await to(axios.get(FOLLOW_API_URL, AXIOS_CONFIG));

  let loads;

  if(err){
  	loads = [
	  	steem.api.getAccountsAsync([account]),
	  	steem.api.getCurrentMedianHistoryPriceAsync(),
	  	steem.api.getDynamicGlobalPropertiesAsync(),
	  	steem.api.getRewardFundAsync('post'),
	  	steem.api.getVestingDelegationsAsync(account, null, 1000),
	  ];	
  }else{
  	loads = [
	  	steem.api.getAccountsAsync([account]),
	  	steem.api.getCurrentMedianHistoryPriceAsync(),
	  	steem.api.getDynamicGlobalPropertiesAsync(),
	  	steem.api.getRewardFundAsync('post'),
	  	steem.api.getVestingDelegationsAsync(account, null, 1000),
	  	axios.get(FOLLOW_API_URL, AXIOS_CONFIG),
	  ];	
  }

  // FOLLOW_API_URL : Bad Gateway 서버 다운으로 인해서 나올 수 있음에 유의해야 한다  
  [err, results] = await to(Promise.all(loads));

  // 값 분석
  if(results[0].length!=1){
		err = `account [ ${account} ] is not exist.`;
	}
  
	// 작업 성공 
  if(!err){
  	spinner.succeed();

  	if(results.length==6){
  		return Promise.resolve({
	    	account:account,
	    	acc:results[0][0],
	    	price:results[1],
	    	global:results[2],
	    	fund:results[3],
	    	delegatees:results[4],
	    	followers:results[5].data[0],
	    });
  	}else{
  		// steemd 사이트 오류 
  		return Promise.resolve({
	    	account:account,
	    	acc:results[0][0],
	    	price:results[1],
	    	global:results[2],
	    	fund:results[3],
	    	delegatees:results[4],
	    });
  	}
    
  }

  // 오류 처리
  if(err){
  	if(spinner&&spinner.isSpinning){
  		spinner.fail();	
  	}
    return Promise.reject(err);
  }	
}

function analysis(data){

	let profile = undefined;
	try{
		profile = JSON.parse(data.acc.json_metadata);
		profile=profile?profile.profile:undefined;
	}catch(e){}

	let total_vesting_shares = getMoney(data.global.total_vesting_shares);
	let total_vesting_fund_steem = getMoney(data.global.total_vesting_fund_steem);

	let profile_image = `https://steemitimages.com/u/${data.acc.name}/avatar`;
	let profile_name = profile?profile.name:undefined;
	let profile_about = profile?profile.about:undefined;
	let profile_location = profile?profile.location:undefined;

	let reputation = steem.formatter.reputation(data.acc.reputation); // reputation
  let vesting_shares = getMoney(data.acc.vesting_shares); // vest
  let received_vesting_shares = getMoney(data.acc.received_vesting_shares); // vest
  let delegated_vesting_shares = getMoney(data.acc.delegated_vesting_shares); // vest

  vesting_shares = vesting_shares + received_vesting_shares - delegated_vesting_shares;
  vesting_shares = steem.formatter.vestToSteem(vesting_shares, total_vesting_shares, total_vesting_fund_steem);
  vesting_shares = Math.round(vesting_shares);

	received_vesting_shares = steem.formatter.vestToSteem(received_vesting_shares, total_vesting_shares, total_vesting_fund_steem);
  received_vesting_shares = Math.round(received_vesting_shares);

  delegated_vesting_shares = steem.formatter.vestToSteem(delegated_vesting_shares, total_vesting_shares, total_vesting_fund_steem);
  delegated_vesting_shares = Math.round(delegated_vesting_shares);  

  let reward_sp = steem.formatter.vestToSteem(getMoney(data.acc.reward_vesting_balance), total_vesting_shares, total_vesting_fund_steem);
  reward_sp = reward_sp.toFixed(3);

  let vp = data.acc.voting_power;	//최근 투표일 기준 보팅파워 
  let tgap = (new Date - new Date(data.acc.last_vote_time + "Z")) / 1000; // 시간흐름 적용 
  let vpc = Math.min(100,(vp + (10000 * tgap / 432000))/100).toFixed(2);	// 현재 기준 보팅파워
	let steemPrice = getMoney(data.price.base) / getMoney(data.price.quote);
	let rewardBalance = getMoney(data.fund.reward_balance);
	let recentClaims = data.fund.recent_claims;
	let getVoteRate = (vw)=>parseInt(((vp * vw / 1e4)+ 49)/50)*100;
	let voteValue = (vw) => vesting_shares / (total_vesting_fund_steem / total_vesting_shares) * getVoteRate(vw) * (rewardBalance / recentClaims) * steemPrice;

	let delegateeValues = [];
	for(let de of data.delegatees){
		let de_date = dateFormat(getLocalTime(de.min_delegation_time),'yyyy-mm-dd HH:MM:ss');
		let de_sp = steem.formatter.vestToSteem(getMoney(de.vesting_shares), total_vesting_shares, total_vesting_fund_steem).toFixed(0);
		delegateeValues.push({val:`아이디 : ${de.delegatee.padStart(16)}, 날짜 : ${de_date}, 스파 : ${de_sp} SP`, en:'info', kr:'정보'});
	}

	let oprofile = {};

	// 팔로워 정보가 오류나는 경우(steemd 사이트 오류) 처리
	if(data.followers){
		oprofile = {
			en : 'profile',
			kr : '프로필',
			values : [
				{val : data.acc.id, en : 'id', kr : '아이디'},
				{val : data.acc.name, en : 'author', kr : '이름'},
				{val : profile_image, en : 'image', kr : '프로필사진'},
				{val : profile_name, en : 'name', kr : '닉네임'},
				{val : profile_about, en : 'about', kr : '정보'},
				{val : profile_location, en : 'location', kr : '사는곳'},
				{val : dateFormat(new Date(data.acc.created), 'yyyy-mm-dd HH:MM:ss'), en : 'created', kr : '계정생성일'},
				{val : data.followers.following_count, en : 'following_count', kr : '팔로잉'},
				{val : data.followers.followers_count, en : 'followers_count', kr : '팔로워'},
				{val : Math.round(data.followers.followers_mvest), en : 'mvest', kr : '팔로워 스파합'},
				{info : `\n(팔로잉/팔로워/스파합 정보는 스냅샷 기준으로 제공되어 실시간 정보와 다를 수 있습니다.)`},
			]
		}
	}else{
		oprofile = {
			en : 'profile',
			kr : '프로필',
			values : [
				{val : data.acc.id, en : 'id', kr : '아이디'},
				{val : data.acc.name, en : 'author', kr : '이름'},
				{val : profile_image, en : 'image', kr : '프로필사진'},
				{val : profile_name, en : 'name', kr : '닉네임'},
				{val : profile_about, en : 'about', kr : '정보'},
				{val : profile_location, en : 'location', kr : '사는곳'},
				{val : dateFormat(new Date(data.acc.created), 'yyyy-mm-dd HH:MM:ss'), en : 'created', kr : '계정생성일'},
				{val : `https://steemdb.com/api/accounts?account=${data.acc.name} 사이트에서 (followers_mvest) 를 확인하세요`, en : 'followers_mvest', kr : '스파합'},
			]
		}
	}

	return [
		oprofile,
		{
			en : 'vote',
			kr : '투표',
			values : [
				{val : reputation, en : 'reputation', kr : '명성'},
				{val : vesting_shares, en : 'vesting_shares', kr : '스파', subfix:'SP'},
				{val : received_vesting_shares, en : 'received_vesting_shares', kr : '스파(임차)', subfix:'SP'},
				{val : delegated_vesting_shares, en : 'delegated_vesting_shares', kr : '스파(임대)', subfix:'SP'},
				{val : dateFormat(getLocalTime(data.acc.last_vote_time), 'yyyy-mm-dd HH:MM:ss'), en : 'last_vote_time', kr : '최근투표일'},
				{val : vpc, en : 'voting_power', kr : '현재 보팅파워', subfix:'%'},
				{val : voteValue(1e4).toFixed(3), en : 'weight 100%', kr : '100% 보팅', subfix:'SBD'},
				{val : voteValue(5e3).toFixed(3), en : 'weight 50%', kr : '50% 보팅', subfix:'SBD'},
				{val : voteValue(1e3).toFixed(3), en : 'weight 10%', kr : '10% 보팅', subfix:'SBD'},
			]
		},
		{
			en : 'money',
			kr : '잔고',
			values : [
				{val : getMoney(data.acc.balance), en : 'balance', kr : '스팀', subfix:'STEEM'},
				{val : getMoney(data.acc.sbd_balance), en : 'sbd_balance', kr : '스달', subfix:'SBD'}
			]
		},
		{
			en : 'reward',
			kr : '보상',
			values : [
				{val : getMoney(data.acc.reward_sbd_balance), en : 'reward_sbd_balance', kr : '스달', subfix:'SBD'},
				{val : getMoney(data.acc.reward_steem_balance), en : 'reward_steem_balance', kr : '스팀', subfix:'STEEM'},
				{val : getMoney(data.acc.reward_vesting_balance), en : 'reward_vesting_balance', kr : '베스트', subfix:'VEST'},
				{val : reward_sp, en : 'reward_vesting_balance', kr : '스파', subfix:'SP'}
			]
		},
		{
			en : 'delegatee',
			kr : '임대',
			values : delegateeValues
		},
	];
}

/*
* 입력 계정의 설정 값이 환경변수 ID값과 일치 시 보상을 청구한다 
* @param data 획득정보
* @param account 계정정보 
* @param wif 포스팅키
*/
async function claimReward(data, account, wif){

	let isClaim = true;
	if(STEEM_AUTHOR && STEEM_KEY_POSTING){
		if(STEEM_AUTHOR!=account){
			isClaim=false;
		}
	}

	if(isClaim && account && wif){
		let reward_steem_balance = data.acc.reward_steem_balance;
    let reward_sbd_balance = data.acc.reward_sbd_balance;
    let reward_vesting_balance = data.acc.reward_vesting_balance;

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
		  spinner.succeed();
		  return Promise.resolve(claim);
    }
	}
	return Promise.resolve('');
}

/*
* 비동기 작업을 수행한다
* @param account 계정명
* @param wif 포스팅키
*/ 
async function processAsyc(account, wif){

	let err;

	// 처리 방식 : 각종 값 로딩 완료 => 분석 => 기타 작업

	// 데이터 로딩
	let data;
  [err, data] = await to(loadingDatas(account));

  // 값 분석
	if(!err){  
  let groups = analysis(data);
	  // 화면 출력
	  console.log();
	  for(let g of groups){
			console.log(`===== ${g.kr} (${g.en}) =====\n`);
			for(let v of g.values){
				if(v.info){
					console.log(`${v.info}`);
				}else{
					console.log(`${v.kr}(${v.en}) : ${v.val?v.val:(v.subfix?0:'N/A')} ${v.subfix?v.subfix:''}`);	
				}				
			}
			console.log(``);
		}
	}

	// 보상청구
	let claim;
	if(!err){
		[err, claim] = await to(claimReward(data,account,wif));
	}

	// 작업 성공 
  if(!err){
    return Promise.resolve(data);
  }

  // 오류 처리
  if(err){
  	if(spinner && spinner.isSpinning){
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
		help('accounts');
		return;	
	}

	let account = args[0];
	let wif = args[1];


	processAsyc(account, wif)
	.then(data=>{
		console.log(`${data.acc.name} 의 계정 분석이 완료 되었습니다.`);
	})
	.catch(e=>{
		console.log(`____________________________________________________________`);
		console.error(e);
		// console.log(e, e.stack);
		console.log(`____________________________________________________________`);
		console.error('오류가 발생 했습니다.위쪽 라인을 참조 바랍니다.');
		console.log(`____________________________________________________________`);
	});
};