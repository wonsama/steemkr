const minimist = require('minimist');	// 외부 파라미터를 자동으로 파싱하여 분류해준다.
const help = require('./cmd/help');
const error = require('./util/error');

// 환경 변수값을 로딩한다 
require("dotenv").config();

/*
* 입력받은 파라미터 정보가 유효한지 검증
* 갯수 또는 설정값에 키
*/
function isValidParams(cmd, params, keys){

	if(params.length>=keys.length){
		return true;
	}

	let isValid = true;
	for(let key of keys){
		let k = process.env[key];
		if(!k){
			isValid = false; 
		}
	}

	// 경고문구 출력
	if(!isValid){
		console.error(`${cmd} 명령을 확인 바랍니다. 기본적으로 ${keys.join(', ')} 의 설정 정보가 필요합니다.`);
	}

	return isValid;
}

module.exports = () => {
	const args = minimist(process.argv.slice(2));
	const cmd = args._[0];
	const params = args._.slice(1);
	const param = params&&params.length>=0?params[0]:undefined;

	// console.log(params);
	// return;

	switch(cmd){
		case 'tl':
		case 'taglive':
			if(isValidParams(cmd, params, ['STEEM_TAG'])){
				require('./cmd/taglive')(params);
			}else{
				require('./cmd/help')('taglive');
			}
		break;
		case 'pw':
		case 'powerup':
			if(isValidParams(cmd, params, ['STEEM_AUTHOR','STEEM_KEY_ACTIVE'])){
				require('./cmd/powerup')(params);
			}else{
				require('./cmd/help')('powerup');
			}
		break;
		case 'bl':
		case 'block':
			if(isValidParams(cmd, params, ['STEEM_AUTHOR'])){
				require('./cmd/block')(params);
			}else{
				require('./cmd/help')('block');
			}
		break;
		case 'fd':
		case 'feed':
			if(isValidParams(cmd, params, ['STEEM_AUTHOR'])){
				require('./cmd/feed')(params);
			}else{
				require('./cmd/help')('feed');
			}
		break;
		case 'sl':
		case 'slb':
			if(isValidParams(cmd, params, ['STEEM_AUTHOR'])){
				require('./cmd/slb')(params);
			}else{
				require('./cmd/help')('slb');
			}
		break;
		case 'hp':
		case 'help':
			require('./cmd/help')(param);
		break;
		case 'cf':
		case 'config':
			require('./cmd/config')(params);				
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
		case 'accounts':
			if(isValidParams(cmd, params, ['STEEM_AUTHOR'])){
				require('./cmd/accounts')(params);	
			}else{
				require('./cmd/help')('accounts');
			}
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