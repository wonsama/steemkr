const {getLocalTime} = require('../util/wdate');
const steem = require('steem');
const ora = require('ora');
const dateFormat = require('dateformat');

const RELOAD_SEC = 10;
const RELOAD_LIMIT = 20;
const RELOAD_BODY_TRUNC = 0;
const RELOAD_BODY_CUT = 200;

// 기본값
const STEEM_TAG = process.env.STEEM_TAG;

let max_load_idx = 0;
function loadContentsByTag(tag) {

    const LOAD_QUERY = {
        tag: tag.toLowerCase(),
        limit: RELOAD_LIMIT, // 20개씩 읽어들여도 충분할 듯 - min 1 ~ max 100
        truncate_body: RELOAD_BODY_TRUNC // 0으로 설정하면 컨텐츠 전체를 가져온다
    };

    let spinner = ora().start(`now loading [ ${tag} ] contents ...`);

    steem.api.getDiscussionsByCreatedAsync(LOAD_QUERY)
        .then(results => {

            // 결과 idx 역순 정렬
            results.sort((a,b)=>getLocalTime(a.created).getTime()-getLocalTime(b.created).getTime());

            let output = [];
            for (let result of results) {

                if (result.id > max_load_idx) {
                    // 결과 추가
                    // @@로 시작하는 수정글을 추가하지 않음 - 아마 comment 쪽으로 들어갈 것임.
                    output.push(result);
                }

                // idx 업데이트
                max_load_idx = Math.max(max_load_idx, result.id);
            }

            if(output.length==0){
            	spinner.succeed(`loaded [ ${tag} ] nothing at ${dateFormat(new Date(),'mm/dd HH:MM:ss')}`);
            }else{
            	spinner.succeed(`loaded [ ${tag} ] ${output.length} contents at ${dateFormat(new Date(),'mm/dd HH:MM:ss')}`);
            }
            

            // 결과 출력
            for(let p of output){

            	let d = getLocalTime(p.created);
            	let tags = [];
							try{
								let _json = JSON.parse(p.json_metadata);
								tags = _json.tags;
							}catch(e){tags=[];}

            	console.log();
							console.log(`■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■`);
							console.log(`⚡️ 제목 : ${p.title}`);
							console.log(`⚡️ 작성일 : ${dateFormat(d,'mm/dd HH:MM:ss')}` ) ;
							console.log(`⚡️ 링크 : https://steemit.com/${p.category}/@${p.author}/${p.permlink}`);
							console.log(`⚡️ 태그 : ${tags.join(", ")}`);
							console.log(`■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■`);
							console.log(p.body.substr(0,RELOAD_BODY_CUT));
							console.log();
            }

            // RELOAD CONTENTS
            setTimeout(() => {
                loadContentsByTag(tag);
            }, 1000 * RELOAD_SEC);
        })
        .catch(e => {
            // 오류 발생 시 컨텐츠를 다시 읽어 들인다.
            spinner.fail(`load fail reload contents at ${dateFormat(new Date(),'mm/dd HH:MM:ss')} - ${e.toString()}`);
            // RELOAD CONTENTS
            setTimeout(() => {
                loadContentsByTag(tag);
            }, 1000 * RELOAD_SEC);
        });
}

module.exports = (args)=>{

	// 입력 파라미터 유효성 검증 
	if(!args || args.length==0){
		// 기본 값 존재여부 확인
		if(STEEM_TAG){
			args = []; args.push(STEEM_TAG);
		}else{
			console.error('\n    [경고] 파라미터 오류  : 아래 메뉴얼을 참조 바랍니다');
			help('taglive');
			return;	
		}
	}

	let tag = args[0];
	loadContentsByTag(tag);
};