const help = require('./help');
const steem = require('steem');
const dateFormat = require('dateformat');
const ora = require('ora');

const LIB_FILE_NAME = 'accounts.js';

let total_vesting_shares;
let total_vesting_fund_steem;

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

// 스팀, 스달에서 값 정보만 추출
// source : 입력값
// 입력금액 합산 (소숫점 아래 3자리 유지)
function getMoney(...source){
	try{

		let sum = 0;
		for(let m of source){
			sum+=Number(m.split(' ')[0]);
		}
		return Number(sum.toPrecision(4));

	}catch(e){
		return 0;
	}
}

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

  // let reward_sp = steem.formatter.vestToSteem(getMoney(result.reward_vesting_balance), total_vesting_shares, total_vesting_fund_steem);
  // reward_sp = reward_sp.toPrecision(4);

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
				{val : getMoney(result.reward_vesting_steem), en : 'reward_vesting_steem', kr : '스파', subfix:'SP'},
				// {val : reward_sp, en : 'reward_vesting_balance', kr : '스파', subfix:'SP'}
			]
		}
	];	
}

module.exports = (args)=>{

	// 입력 파라미터 유효성 검증 
	if(!args || args.length==0){
		// console.error('    parameter error see below :');
		console.error('\n    [경고] 파라미터 오류  : 아래 메뉴얼을 참조 바랍니다');
		help('accounts');
		return;
	}

	// 스피너 동작
	let spinner = ora().start('load properties');

	// 글로벌 설정 값 로드 
	steem.api.getDynamicGlobalPropertiesAsync().then(result=>{
			
			spinner.succeed('load properties - success');

	    total_vesting_shares = getMoney(result.total_vesting_shares);
	    total_vesting_fund_steem = getMoney(result.total_vesting_fund_steem);

	    spinner.start('load accounts');
	    // 계정 목록 정보 로드
	    return steem.api.getAccountsAsync(args);
	}).catch(e=>{
		// spinner.stop();
		spinner.fail('load properties - fail');
		console.error(`${LIB_FILE_NAME} - fail step 1 : `, e);
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
	}).catch(e=>{
		spinner.fail('load accounts - fail');
		console.error(`${LIB_FILE_NAME} - fail step 2 : `, e);
	});
};