const steem = require('steem');
const axios = require('axios');
const asciichart = require ('asciichart');
const ora = require('ora');


function getCoin(args){
	const DEF_COIN = 'STEEM';
	let coin = args&&args.length>=1?args[0]:undefined;
	const avail = [
	'EOS',	// 이오스 
	'TRX',	// 트론
	'BTC',	// 비트코인
	'ADA',	// 에이다
	'ETH',	// 이더리움
	'XRP',	// 리플
	'BCC',	// 비트코인캐시
	'SC',	// 시아코인
	'ZIL',	// 질리카
	'STORM',	// 스톰
	'QTUM',	// 퀀텀
	'ONT',	// 온톨로지
	'GRS',	// 그로스톨코인
	'NEO',	// 네오
	'SNT',	// 스테이터스네트워크토큰
	'XLM',	// 스텔라루멘
	'ICX',	// 아이콘
	'GTO',	// 기프토
	'GNT',	// 골렘
	'POLY',	// 폴리매쓰
	'ETC',	// 이더리움클래식
	'OMG',	// 오미세고
	'ARDR',	// 아더
	'SBD',	// 스팀달러
	'STEEM',	// 스팀
	'BTG',	// 비트코인골드
	'XEM',	// 뉴이코노미무브먼트
	'LTC',	// 라이트코인
	'IGNIS',	// 이그니스
	'TIX',	// 블록틱스
	'EMC2',	// 아인스타이늄
	'SRN',	// 시린토큰
	'WAVES',	// 웨이브
	'POWR',	// 파워렛져
	'MER',	// 머큐리
	'MTL',	// 메탈
	'XMR',	// 모네로
	'STRAT',	// 스트라티스
	'ARK',	// 아크
	'ZRX',	// 제로엑스
	'LSK',	// 리스크
	'PIVX',	// 피벡스
	'DCR',	// 디크레드
	'STORJ',	// 스토리지
	'KMD',	// 코모도
	'REP',	// 어거
	'MCO',	// 모나코
	'VTC',	// 버트코인
	'ZEC',	// 지캐시
	'DASH'	// 대시
	];

	if(coin){
		if(avail.includes(coin)){
			return coin;
		}else{
			console.log( `코인 종류는 ${avail} 중에서 택 1 바랍니다.` );
			return DEF_COIN;		
		}
	}
	return DEF_COIN;
}

module.exports = (args)=>{
	
	// console.log('args', args);

	const MARKET = 'KRW';	// 일단 원화 마켓만
	const COIN = getCoin(args);
	const AXIOS_CONFIG = {
	  headers: {'user-agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/51.0.2704.103 Safari/537.36'}
	};
	// @see https://steemit.com/kr/@segyepark/api
	const UPBIT_URL = `https://crix-api-endpoint.upbit.com/v1/crix/candles/lines?code=CRIX.UPBIT.${MARKET}-${COIN}`;
	const ASCII_CONFIG = {
	    offset:  2,          // axis offset from the left (min 2)
	    padding: '           ',  // padding string for label formatting (can be overrided)
	    height:  10,         // any height you want	
	};

	let prices = [];

	// (STEEM) 스피너 동작
	spinner = ora().start('load prices');

	axios.get(UPBIT_URL, AXIOS_CONFIG)
	.then(result=>{

		spinner.succeed('load prices - success');

		let prevClosingPrice = result.data.prevClosingPrice; // 어제 종가
		let tradePrice = result.data.candles.tradePrice;	// 거래가 

		for(let candle of result.data.candles){
			let tradePrice = candle.tradePrice;
			prices.push(tradePrice);
		}
		prices.reverse();

		let now = result.data.candles[0].candleDateTimeKst.replace('T', ' ').replace('+09:00', '');

		console.log( `오늘의 ${COIN} 가격 흐름` );
		console.log( `(${now} 기준) 현재 가격 : ${prices[prices.length-1]}`  );
		console.log( asciichart.plot(prices, ASCII_CONFIG) );
	})
	.catch(e=>{
		spinner.succeed('load prices - fail');
		console.log(e);
	});
};