const help = require('./help');
const {getNowCHour} = require('../util/wdate');
const {getMoney} = require('../util/wsteem');
const {to} = require('../util/wutil');
const {question} = require('../util/wutil');

const steem = require('steem');
const dateFormat = require('dateformat');
const axios = require('axios');
const ora = require('ora');

const DEFAULT_ORDER_LIMIT = 500;

// 기본값

const STEEM_AUTHOR = process.env.STEEM_AUTHOR;
const STEEM_KEY_ACTIVE = process.env.STEEM_KEY_ACTIVE;
const STEEM_ORDER_LIMIT = process.env.STEEM_ORDER_LIMIT;


/*
* 스달을 가지고서 스팀을 구매한다
* @param account 계정명
* @param wif 해당 계정의 ACTIVE KEY
* @param limit 최근 거래기록 가져올 갯수 (1~500, 기본 500)
*/
let spinner;
async function buysbd(account, wif, limit){
    
  // 오류처리용
  let err;

  // 계정정보 확인
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

  spinner.succeed(' ');
  console.log(`____________________________________________________________`);
  console.log(` [buysbd] STEEM을 가지고 SBD을 구매`);
  
  // 잔액정보 확인
  let balance = acc[0].balance;
  let steem_balance = getMoney(balance);
  if(steem_balance==0){
      // 오류처리
      return Promise.reject(`@${account} 님의 STEEM 잔액이 0.000 SBD 입니다.`);
  }

  console.log(`____________________________________________________________`);
  console.log(` @${account} 님의 STEEM 잔고 : ${balance}`);
  console.log(`____________________________________________________________`);

  // UPBIT 가격확인 SBD/STEEM
  const AXIOS_CONFIG = {
    headers: {'user-agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/51.0.2704.103 Safari/537.36'}
  };
  const UPBIT_SBD = `https://crix-api-endpoint.upbit.com/v1/crix/candles/lines?code=CRIX.UPBIT.KRW-SBD`;
  const UPBIT_STEEM = `https://crix-api-endpoint.upbit.com/v1/crix/candles/lines?code=CRIX.UPBIT.KRW-STEEM`;
  let upsbd, upsteem;
  let psbd, psteem;
  spinner = ora().start('loading sbd');
  [err, upsbd] = await to(axios.get(UPBIT_SBD, AXIOS_CONFIG));
  if(upsbd){
    spinner.succeed(' ');
    let now = upsbd.data.candles[0].candleDateTimeKst.replace('T', ' ').replace('+09:00', '');
    psbd = Number(upsbd.data.candles[0].tradePrice);
    console.log(` 1 SBD : ${psbd} 원 ( upbit ${now} 기준 )`);
  }else{
    // 오류처리
    spinner.fail();
    return Promise.reject(err.toString());
  }
  spinner = ora().start('loading steem');
  [err, upsteem] = await to(axios.get(UPBIT_STEEM, AXIOS_CONFIG));
  if(upsteem){
    spinner.succeed(' ');
    let now = upsteem.data.candles[0].candleDateTimeKst.replace('T', ' ').replace('+09:00', '');
    psteem = Number(upsteem.data.candles[0].tradePrice);
    console.log(` 1 STEEM : ${psteem} 원 ( upbit ${now} 기준 )`);
  }else{
    // 오류처리
    spinner.fail();
    return Promise.reject(err.toString());
  }
  

  // 최근 내부거래소 거래내역조회
  // bids : 매수(sbd => steem 구매), asks : 매도(steem => sbd 구매) 
  let orders;
  spinner = ora().start('loading orders');
  [err, orders] = await to(steem.api.getOrderBookAsync(limit));
  if(err){
    // 오류처리
    spinner.fail();
    return Promise.reject(err.toString());
  }
  spinner.succeed(' ');

  console.log(` UPBIT RATE (STEEM/SBD) KRW : ${psteem/psbd}`);

  let min = Number.MAX_SAFE_INTEGER;
  let max = 0;
  let order_price;
  let lastest = orders.bids[0].real_price;
  for(let bid of orders.bids){
    // if(min>Number(bid.real_price)){
    //   min = bid.real_price;
    //   order_price = bid.order_price;
    // }
    min = Math.min(min,Number(bid.real_price));
    // max = Math.max(max,Number(bid.real_price));
    if(max<Number(bid.real_price)){
      max = bid.real_price;
      order_price = bid.order_price;
    }
  }

  // sbd / steem
  // real_price : 낮을수록 저렴
  console.log(`____________________________________________________________`);
  console.log(` 매수(bids) 비율가(SBD/STEEM) - 수치가 높을수록 싸게 산것`);
  console.log(` 최근 ${limit} 개 거래의 가격을 바탕으로 나타냄`);
  console.log(`____________________________________________________________`);
  console.log(` 최저가(min) : ${min}`);
  console.log(` 최고가(max) : ${max} [ quote : ${order_price.quote}, base : ${order_price.base} ]`);
  console.log(` 최근가(lastest) : ${lastest}`);
  console.log(`____________________________________________________________`);

  // 교환 금액 문의
  let amount;
  [err,amount] = await to(question(`STEEM 을 얼마나 교환하시겠습니까 ( Max : ${balance} / 기본값 all ) ? `));
  if(!amount){
    // 오류처리
    // return Promise.reject('취소 하셨습니다.');
    // 전체
    amount = steem_balance;
  }else if(amount.toLowerCase()=='all'){
    // 전체
    amount = steem_balance;
  }else if(isNaN(amount)){
    // 오류처리
    return Promise.reject(`x.xxx 형태의 숫자만 입력 가능합니다.`);
  }else if(Number(amount)<=0){
    // 오류처리
    return Promise.reject(`0 이상으로 입력해야 됩니다.`);
  }else if(Number(amount)>steem_balance){
    // 오류처리
    return Promise.reject(`입력 값( ${amount} ) 는 잔고( ${steem_balance} ) 을(를) 초과할 수 없습니다.`);
  }

  console.log(`____________________________________________________________`);
  console.log(` 최저가 : ${(amount*min).toFixed(3)} SBD 획득`);
  console.log(` 최근가 : ${(amount*lastest).toFixed(3)} SBD 획득`);
  console.log(`____________________________________________________________`);
  console.log(` 1. 최고가 : ${(amount*max).toFixed(3)} SBD 획득`);
  console.log(` 2. 직접입력`);
  console.log(`____________________________________________________________`);

  // 교환 방식 문의 : min, max, lastest, 직접입력
  let type;
  let change;
  [err,type] = await to(question(`교환방식을 선택 바랍니다. ( 1 ~ 2 / 기본값 1 ) : `));
  switch(type){
    case '1':
      change = (amount*max).toFixed(3);
    break;
    case '2':
      [err,change] = await to(question(`${amount} STEEM 와 교환 할 SBD 량 (x.xxx) 을 입력바랍니다 : `));
      if(err){
        // 오류처리
        return Promise.reject(err.toString());
      }else if(isNaN(change)){
        // 오류처리
        return Promise.reject(`x.xxx 형태의 숫자만 입력 가능합니다.`);
      }else if(Number(change)<=0){
        // 오류처리
        return Promise.reject(`0 이상으로 입력해야 됩니다.`);
      }
    break;
    default:
      // 오류처리
      // return Promise.reject('취소 하셨습니다.');
      change = (amount/min).toFixed(3);
    break;
  }

  // 입력 정보 재 확인
  let owner = account;                    // 내 계정명 
  let orderid = Number(new Date().getTime().toString().substr(4));     // 거래 취소에 필요한 order id 유니크 해야됨, uint32 : max 4294967295
  let amount_to_sell = `${Number(amount).toFixed(3)} STEEM`;   // 판매 스팀량
  let min_to_receive = `${Number(change).toFixed(3)} SBD`; // 구매 스달량 
  let fill_or_kill = false;               // ???
  let expiration = getNowCHour(9).toISOString().substr(0,19); // 거래 만료 시간 설정 - 기본 9시간 뒤
  console.log(`____________________________________________________________`);
  console.log(`orderid : ${orderid} ( 거래 취소 시 필요한 번호 입니다 )`);
  console.log(`SELL : ${amount_to_sell}`);
  console.log(`BUY  : ${min_to_receive}`);
  console.log(`____________________________________________________________`);

  // 계속진행할지 여부를 확인
  let go;
  [err,go] = await to(question(`교환을 진행하시겠습니까 ? ( y / n / 기본값 n ) : `));
  if(!go){
  	// 오류처리
    return Promise.reject('취소 하셨습니다.');	
  }else{
  	if(go.toLowerCase()!='y'){
  		// 오류처리
    	return Promise.reject('취소 하셨습니다.');	
  	}
  }

  // 내부 거래소에 등록처리를 수행한다
  let register;
  spinner = ora().start('sending orders');
  [err, register] = await to(steem.broadcast.limitOrderCreateAsync(wif, owner, orderid, amount_to_sell, min_to_receive, fill_or_kill, expiration));

  if(err){
    // 오류처리
    spinner.fail();
    return Promise.reject(err.toString());
  }
  // 결과 확인
  spinner.succeed(' ');
  console.log(`거래( ${orderid} ) 가 정상적으로 등록되었습니다.`)
  return Promise.resolve();
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

	// 2번째 : 엑티브 키
	if(args.length==1){
		if(STEEM_KEY_ACTIVE){
			args.push(STEEM_KEY_ACTIVE);
		}
	}

	// 3번째 : 미설정 시 기본값을 넣어준다
	if(args.length==2){
    if(STEEM_ORDER_LIMIT){
      args.push(STEEM_ORDER_LIMIT);
    }else{
			args.push(DEFAULT_ORDER_LIMIT);
    }
	}

	return args;
}

module.exports = (args)=>{

	// 파라미터 초기화
	args = initParams(args);

	// 입력 파라미터 유효성 검증 
	if(args.length!=3){
		console.error('\n    [경고] 파라미터 오류  : 아래 메뉴얼을 참조 바랍니다');
		help('buysteem');
		return;
	}

	let author = args[0];			// 계정
	let activekey = args[1];	// 엑티브키 
	let limit = args[2];			// hidden params - default : 10

	// 스달 구매를 진행한다
	buysbd(author, activekey, limit).catch(e=>{
		console.log(`____________________________________________________________`);
		console.error(e);
		console.log(`____________________________________________________________`);
		console.error('거래가 실패 했습니다 - 처음부터 다시 진행 부탁 드립니다.');
		console.log(`____________________________________________________________`);
	});
};