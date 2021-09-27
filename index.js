let today = document.getElementById('today');
let wordsBox = document.getElementById('wordsBox');
let mainVersion = document.getElementById('mainVersion');
let subVersion = document.getElementById('subVersion');
let copyAll = document.getElementById('copyAll');

let mainBook;
let subBook;
let notyTimeout;
let chapter = new Date().getDate();
let numberOfVerse;
let isSaved = !!localStorage.getItem(chapter.toString());
let verseMemo = isSaved ? JSON.parse(localStorage.getItem(chapter.toString())) : {};

let todayDate = new Date().getMonth()+1 + '월 ' + chapter + '일';
today.innerText = todayDate;

let mainV = mainVersion.value + '.json';
let subV = subVersion.value + '.json';

//구절 선택 이벤트
const selectVerse = async id => {
  //선택된 구절 스타일 변경
  let selectedVerse = document.getElementById(id);
  if (selectedVerse.style.color === "black") {
    selectedVerse.style.color = "#003399";
    selectedVerse.style.fontWeight = '500';
    verseMemo[id] = true;
  } else {
    selectedVerse.style.color = "black";
    selectedVerse.style.fontWeight = '400';
    delete verseMemo[id];
  }

  localStorage.setItem(chapter.toString(), JSON.stringify(verseMemo));

  //선택된 구절 클립보드에 복사
  let str = '';
  for(let i=1;i<=numberOfVerse;++i){
    if(verseMemo[i]){
      str = str + i + ". " + mainBook[i] + '\n';
    }
  }
  str = str + '잠언 ' + chapter + '장';
  await navigator.clipboard.writeText(str);

  copyNoty()
}

//성경 불러오기
const getBook = () => {
  fetch(mainV)
    .then(result => {return result.json()})
    .then(data => {
      mainBook = data.book[chapter-1][chapter];
      numberOfVerse = Object.keys(mainBook).length;

      let info = document.createElement('p');
      info.innerHTML = '잠언 ' + chapter + '장';
      wordsBox.appendChild(info)

      //대역이 없는 경우
      if(subV === 'none.json'){
        for(let key in mainBook){
          let verse = document.createElement('p');
          verse.id = key

          //메모가 된 경우 반영
          if(verseMemo[key]){
            verse.style.color = '#003399';
            verse.style.fontWeight = '500';
          }
          else {
            verse.style.color = 'black';
            verse.style.fontWeight = '400';
          }

          verse.innerHTML = key + ". " + mainBook[key];
          wordsBox.appendChild(verse);

          verse.onclick = async event => {
            await selectVerse(event.target.id)
          }
        }
      }
      //대역이 있는 경우
      else {
        fetch(subV)
          .then(result => {return result.json()})
          .then(data => {
            subBook = data.book[chapter-1][chapter];

            for(let key in mainBook){
              let verse = document.createElement('p');
              verse.id = key;

              //메모가 된 경우 반영
              if(verseMemo[key]){
                verse.style.color = '#003399';
                verse.style.fontWeight = '500';
              }
              else {
                verse.style.color = 'black';
                verse.style.fontWeight = '400';
              }

              verse.innerHTML = '<br/>' + key + ". " + mainBook[key] + '<br/>' +  key + ". " + subBook[key];
              wordsBox.appendChild(verse);

              verse.onclick = async event => {
                await selectVerse(event.target.id)
              }

            }
          })
      }
    })
}

//최초 실행 페이지
getBook();

//초기화
const resetWordsBox = () => {
  while(wordsBox.firstChild){
    wordsBox.removeChild(wordsBox.firstChild)
  }
}

//복사 알림
const copyNoty = () => {
  today.innerText = 'copied!';
  if(notyTimeout)  clearTimeout(notyTimeout);
  notyTimeout = setTimeout(() => {
    today.innerText = todayDate;
  },1500);
}


//번역 변경 시
mainVersion.addEventListener('change', event => {
  mainV = event.target.value + '.json';

  resetWordsBox()
  getBook()
})

subVersion.addEventListener('change', event => {
  subV = event.target.value + '.json';

  resetWordsBox()
  getBook()
})

//전체 복사
copyAll.addEventListener('click', async () => {
  let str = '잠언 ' + chapter + '장' + '\n';
  for(let i=1;i<=numberOfVerse;++i){
    str = str + i + ". " + mainBook[i] + '\n';
  }
  await navigator.clipboard.writeText(str);
  copyNoty()
})
