import { initializeApp } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-app.js";
import { getDatabase, ref, set, get, update } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-database.js";


// TODO: Replace the following with your app's Firebase project configuration
// See: https://firebase.google.com/docs/web/learn-more#config-object
const firebaseConfig = {
    apiKey              : "AIzaSyAfVLdvbCR5hgZeONZt_4rE3p35_ffJSs8",
    authDomain          : "webcon-c2622.firebaseapp.com",
    databaseURL         : "https://webcon-c2622-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId           : "webcon-c2622",
    storageBucket       : "webcon-c2622.appspot.com",
    messagingSenderId   : "1027065139424",
    appId               : "1:1027065139424:web:a29eaa11c735d9b16c0085",
    measurementId       : "G-42HQ874EBH"
  };

let postSaveDto = {
    name        : '',       // 이름
    rltnType    : '',       // 관계타입
    content     : '',       // 내용
    attndYn     : '',       // 참석여부
    regDt       : new Date().toLocaleString(),       // 등록일자
}

const app = initializeApp(firebaseConfig);

function getRandomInt(min, max) {
    const minCeiled = Math.ceil(min);
    const maxFloored = Math.floor(max);
    return Math.floor(Math.random() * (maxFloored - minCeiled) + minCeiled); // The maximum is exclusive and the minimum is inclusive
}


/**
 *  공통코드
 */
export const attnType = getAttnTypeCmmnCd();
export const rltnType = getRltnTypeCmmnCd();

async function getAttnTypeCmmnCd(){

    let result = {};

    await get(ref(getDatabase(app), '/cmmnCd/attnType'))
    .then((snap)=>{
        result = snap.val();
    })
    .catch((err)=>{
        console.log(err);
    });

    return result;
   
}

async function getRltnTypeCmmnCd(){

    let result = {};

    await get(ref(getDatabase(app), '/cmmnCd/rltnType'))
    .then((snap)=>{
        result = snap.val()
    })
    .catch((err)=>{
        console.log(err);
    });

    return result;
    
}

  /** 
   * post id 가져오기
   */
async function getPostIndex(){
    
    let index = 0;

    await get(ref(getDatabase(app), '/postsLastId'))
    .then((snap)=>{
        if(snap.exists()){
            index = snap.val();
        }
        else{
            index = getRandomInt(10000, 99999);
        }
    })
    .catch((error)=>{
        console.error(error);
        index = getRandomInt(10000, 99999);
    });

    return index;
}

function createPostSaveDto(name, rltnType, content, attndType){

    let dto = {
        name        :'',        // 이름
        rltnType    :'',        // 관계타입
        content     :'',        // 내용
        attndYn     :'',        // 참석여부
        regDt       :new Date().toLocaleString(),   // 등록일자
    }

    if(!name){
        dto.errMsg = '이름을 입력해 주세요.';
    }
    else if(!rltnType){
        dto.errMsg = '관계를 지정해 주세요.';
    }
    else if(!content){
        dto.errMsg = '내용을 입력해 주세요.';
    }
    else if(!attndType){
        dto.errMsg = '참석여부를 선택해 주세요.';
    }
    else{
        dto.name        = name;
        dto.rltnType    = rltnType;
        dto.attndYn     = attndType;
        dto.content     = content;
    }

    return dto;
}

function writePost(postSaveDto, sucCb, failCb){

    const db    = getDatabase(app);
    getPostIndex().then((value)=>{
        set(ref(db, `/posts/post_${value}`), postSaveDto)
        .then(()=>{
            updatePostId(value, db, sucCb);
        })
        .catch((err)=>{
            failCb(err);
            console.error(err);
        });
    });

}

function updatePostId(currIdx, db,  cb){
    update(ref(db), {'/postsLastId' : currIdx + 1}).then(()=>{
        cb();
    });
}

export function savePost(params){

    let saveDto = createPostSaveDto(params.name, params.rltnType, params.content, params.attndType);

    if(saveDto.errMsg){
        alert(saveDto.errMsg);
        return;
    }
    else{
        writePost(saveDto, params.sucCb, params.failCb);
    }

}

export async function getAllPost(){

    let result = '';

    await get(ref(getDatabase(app), '/posts'))
    .then((snap)=>{
        result = snap.val();
    })
    .catch((error)=>{
        console.error(error);
    });

    return result;
}

