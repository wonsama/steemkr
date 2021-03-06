const minimist = require('minimist');	// 외부 파라미터를 자동으로 파싱하여 분류해준다.
const help = require('./cmd/help');
const error = require('./util/error');
const steem = require('steem');

// 환경 변수값을 로딩한다 
require("dotenv").config();

// 노드 변경 참조
// https://geo.steem.pl/
// http://steemistry.com/nodes/ 
// steem.api.setOptions({ url: 'https://rpc.buildteam.io' });
// steem.api.setOptions({ url: 'https://api.steem.house' });
// steem.api.setOptions({ url: 'https://api.steemit.com' });
// wss://rpc.dist.one/

module.exports = () => {
	const args = minimist(process.argv.slice(2));
	const cmd = args._[0];
	const params = args._.slice(1);
	const param = params&&params.length>=0?params[0]:undefined;

	// console.log(params);
	// return;

	switch(cmd){
		case 'rp':
		case 'replies':
			require('./cmd/replies')(params);
		break;
		case 'vd':
		case 'votedesc':
			require('./cmd/votedesc')(params);
		break;
		case 'sp':
		case 'scrappost':
			require('./cmd/scrappost')(params);
		break;
		case 'vg':
		case 'votegroup':
			require('./cmd/votegroup')(params);
		break;
		case 'cr':
		case 'create':
			require('./cmd/create')(params);
		break;
		case 'hi':
		case 'history':
			require('./cmd/history')(params);
		break;
		case 'vo':
		case 'voteto':
			require('./cmd/voteto')(params);
		break;
		case 'ct':
		case 'convert':
			require('./cmd/convert')(params);
		break;
		case 'bd':
		case 'buysbd':
			require('./cmd/buysbd')(params);
		break;
		case 'bc':
		case 'buycancel':
			require('./cmd/buycancel')(params);
		break;
		case 'bm':
		case 'buysteem':
			require('./cmd/buysteem')(params);
		break;
		case 're':
		case 'resteem':
			require('./cmd/resteem')(params);
		break;
		case 'tl':
		case 'taglive':
			require('./cmd/taglive')(params);
		break;
		case 'pw':
		case 'powerup':
			require('./cmd/powerup')(params);
		break;
		case 'bl':
		case 'block':
			require('./cmd/block')(params);
		break;
		case 'fd':
		case 'feed':
			require('./cmd/feed')(params);
		break;
		case 'sl':
		case 'slb':
			require('./cmd/slb')(params);
		break;
		case 'hp':
		case 'help':
			require('./cmd/help')(param);
		break;
		case 'pr':
		case 'price':
			require('./cmd/price')(params);
		break;
		case 'vr':
		case 'version':
			require('./cmd/version')(params);
		break;
		case 'ac':
		case 'account':
		case 'accounts':
			require('./cmd/account')(params);
		break;
		case undefined:
			error(`\n    하위 명령어가 존재하지 않습니다. 아래 메뉴얼을 참조 바랍니다.`, false);
			help();
		break;
		default:
			error(`"${cmd}" 은 유효한 명령어가 아닙니다 !`, true);
		break;
	}
}