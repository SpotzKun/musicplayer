
$(function () {// เปลี่ยนแทร็กของ HTML เป็นตัวแปร Js
  var playerTrack = $("#player-track"),
    bgArtwork = $("#bg-artwork"),
    bgArtworkUrl,
    albumName = $("#album-name"),
    trackName = $("#track-name"),
    albumArt = $("#album-art"),
    sArea = $("#s-area"),
    seekBar = $("#seek-bar"),
   
    trackTime = $("#track-time"),
    insTime = $("#ins-time"),
    sHover = $("#s-hover"),
    playPauseButton = $("#play-pause-button"),
    i = playPauseButton.find("i"),
    tProgress = $("#current-time"),
    tTime = $("#track-length"),
    seekT,//เพิ่มตัวแปร
    seekLoc,
    seekBarPos,
    cM,
    ctMinutes,
    ctSeconds,
    curMinutes,
    curSeconds,
    durMinutes,
    durSeconds,
    playProgress,
    bTime,
    nTime = 0,
    buffInterval = null,
    tFlag = false,
    albums = [//ชื่อเพลง
      "3:03 PM",
      "Constant Moderato"
    ],
    trackNames = [//ชื่อแทร็กเพลง
      "Sharou - 3:03 PM",
      "Blue Archive OST - Constant_Moderato "
    ],
    albumArtworks = ["_1","_2"],//ภาพปกเพลงในแผ่นดิสก์
    trackUrl = [//URL เพลง
      "music/3_03PM _Sharou.mp3",
      "music/[Blue_Archive]_Constant_Moderato.mp3"
    ],

    playPreviousTrackButton = $("#play-previous"),//เกี่ยวกับปุ่มเล่นเพลงต่อไปและย้อนกลับ #แปลกตรงเอาออกแล้วทำให้ทุกปุ่มไม่ทำงาน
    playNextTrackButton = $("#play-next"),
    currIndex = -1;

  function playPause() {//ปุ่มเล่นและหยุดเพลง
    setTimeout(function () {
      if (audio.paused) {
        playerTrack.addClass("active");//pause
        albumArt.addClass("active");
        checkBuffering();
        i.attr("class", "fas fa-pause");
        audio.play();
      } else {
        playerTrack.removeClass("active");//play
        albumArt.removeClass("active");
        clearInterval(buffInterval);
        albumArt.removeClass("buffering");
        i.attr("class", "fas fa-play");
        audio.pause();
      }
    }, 300);
  }

  function showHover(event) {//บาร์เพลง #เอาออกไม่สามารถใช้แท็บเลื่อนเวลาได้
    seekBarPos = sArea.offset();
    seekT = event.clientX - seekBarPos.left;
    seekLoc = audio.duration * (seekT / sArea.outerWidth());

    sHover.width(seekT);

    cM = seekLoc / 60;

    ctMinutes = Math.floor(cM);
    ctSeconds = Math.floor(seekLoc - ctMinutes * 60);

    if (ctMinutes < 0 || ctSeconds < 0) return;


    if (ctMinutes < 0 || ctSeconds < 0) return;

    if (ctMinutes < 10) ctMinutes = "0" + ctMinutes;
    if (ctSeconds < 10) ctSeconds = "0" + ctSeconds;

    if (isNaN(ctMinutes) || isNaN(ctSeconds)) insTime.text("--:--");
    else insTime.text(ctMinutes + ":" + ctSeconds);

    //insTime.css({ left: seekT, "margin-left": "-21px" }).fadeIn(0);//บอกเวลาจากบาร์เวลาเพลง #เอาออกแค่เม้าส์ชี้แล้วตัวบอกเวลาไม่ขึ้น
  }

  function hideHover() {//ตัวเฟด #เอาออกเกิดบัค ติดbuffer ใช้ตัวเลื่อนเวลาในบาร์เพลงได้ ตัวบอกเวลาเมื่อเม้าส์ชี้ค้าง ตัวบอกเวลาปัจจุบันกับเวลาสุดท้ายของเพลงไม่ทำงาน แต่เพลงยังเล่นได้
    sHover.width(0);
    insTime.text("00:00").css({ left: "0px", "margin-left": "0px" }).fadeOut(0);
  }

  function playFromClickedPos() {//ตัวบอกเวลาและเกี่ยวกับภาพปก #เอาออกเกิดบัค ติดbuffer และ ตัวบอกเวลาปัจจุบันกับเวลาสุดท้ายของเพลงไม่ทำงาน แต่เพลงยังเล่นได้
    audio.currentTime = seekLoc;
    seekBar.width(seekT);
    hideHover();
  }

  function updateCurrTime() {//ตัวอัพเดตเวลาเพลงในแทร็กและใช้ในการ buffer #เอาออก buffer ไม่ทำงานและทำให้เพลงเล่นไม่ได้ 
    nTime = new Date();
    nTime = nTime.getTime();

    if (!tFlag) {
      tFlag = true;
      trackTime.addClass("active");
    }

    curMinutes = Math.floor(audio.currentTime / 60);//เกี่ยวกับบาร์เวลาเพลงและตัวบอกเวลาเพลง #เอาออกตัวบอกเวลาไม่ทำงานและบาร์เพลงจะไม่ทำงาน แต่เพลงยังเล่นได้
    curSeconds = Math.floor(audio.currentTime - curMinutes * 60);

    durMinutes = Math.floor(audio.duration / 60);
    durSeconds = Math.floor(audio.duration - durMinutes * 60);

    playProgress = (audio.currentTime / audio.duration) * 100;

    if (curMinutes < 10) curMinutes = "0" + curMinutes;
    if (curSeconds < 10) curSeconds = "0" + curSeconds;

    if (durMinutes < 10) durMinutes = "0" + durMinutes;
    if (durSeconds < 10) durSeconds = "0" + durSeconds;

    if (isNaN(curMinutes) || isNaN(curSeconds)) tProgress.text("00:00");
    else tProgress.text(curMinutes + ":" + curSeconds);

    if (isNaN(durMinutes) || isNaN(durSeconds)) tTime.text("00:00");
    else tTime.text(durMinutes + ":" + durSeconds);

    if (
      isNaN(curMinutes) ||
      isNaN(curSeconds) ||
      isNaN(durMinutes) ||
      isNaN(durSeconds)
    )
      trackTime.removeClass("active");
    else trackTime.addClass("active");

    seekBar.width(playProgress + "%");//เอาออกเพลงจะเล่นไม่ได้

    if (playProgress == 100) {//ตัวบาร์เวลาเพลง #เอาออกตัวบอกเวลาจะไม่กลับไปจุดเริ่มต้น buffer ค้างตอนเล่นเพลงเสร็จ แต่เพลงยังเล่นได้แบบไม่มีปัญหา
      i.attr("class", "fa fa-play");
      seekBar.width(0);
      tProgress.text("00:00");
      albumArt.removeClass("buffering").removeClass("active");
      clearInterval(buffInterval);
    }
  }

  function checkBuffering() {//ตัวเช็คการ buffer #เอาออกเพลงเล่นไม่ได้(ติดbuffer แต่ไม่แสดงผล)
    clearInterval(buffInterval);
    buffInterval = setInterval(function () {
      if (nTime == 0 || bTime - nTime > 1000) albumArt.addClass("buffering");
      else albumArt.removeClass("buffering");

      bTime = new Date();
      bTime = bTime.getTime();
    }, 100);
  }

  function selectTrack(flag) {//ตัวแทร็กเพลง #เอาออกเพลงไม่ทำงาน
    if (flag == 0 || flag == 1) ++currIndex;
    else --currIndex;

    if (currIndex > -1 && currIndex < albumArtworks.length) {
      if (flag == 0) i.attr("class", "fa fa-play");
      else {
        albumArt.removeClass("buffering");
        i.attr("class", "fa fa-pause");
      }

      seekBar.width(0);
      trackTime.removeClass("active");
      tProgress.text("00:00");
      tTime.text("00:00");

      currAlbum = albums[currIndex];//#เอาออกเพลงไม่ทำงาน
      currTrackName = trackNames[currIndex];
      currArtwork = albumArtworks[currIndex];

      audio.src = trackUrl[currIndex];

      nTime = 0;
      bTime = new Date();
      bTime = bTime.getTime();

      if (flag != 0) {
        audio.play();
        playerTrack.addClass("active");
        albumArt.addClass("active");

        clearInterval(buffInterval);
        checkBuffering();
      }

      albumName.text(currAlbum);//ตัวโชว์อัลบั้ม และปกภาพเพลง #เอาออกติดบัค ภาพไม่เปลี่ยนเมื่อเปลี่ยนเพลง ตัวเล่นเพลงลอย ไม่บอกอัลบั้มเพลง แต่เพลงยังเล่นได้
      trackName.text(currTrackName);
      albumArt.find("img.active").removeClass("active");
      $("#" + currArtwork).addClass("active");

      bgArtworkUrl = $("#" + currArtwork).attr("src");

      bgArtwork.css({ "background-image": "url(" + bgArtworkUrl + ")" });
    } else {
      if (flag == 0 || flag == 1) --currIndex;
      else ++currIndex;
    }
  }
  
  function initPlayer() {
    audio = new Audio();// ตัวเพลง/เสียง #เอาออกจะเล่นเพลงไม่ได้

    selectTrack(0);

    audio.loop = false;//ลูปเพลง

    playPauseButton.on("click", playPause);//เล่นเพลงเมื่อกดปุ่ม #เอาออกปุ่มเล่นและหยุดจะไม่ทำงาน

    sArea.mousemove(function (event) {//เฟดตัวบอกเวลาในบาร์เพลงออก เมื่อเม้าส์ออก #เอาออกตัวบอกเวลาจะไม่ขึ้นแต่ไม่เกิดอะไรกับเพลง
      showHover(event);
    });

    sArea.mouseout(hideHover);//เฟดตัวบอกเวลาในบาร์เพลงออก เมื่อเม้าส์ออก #เอาออกตัวบอกเวลาค้างอยู๋แต่เพลงยังเล่นได้

    sArea.on("click", playFromClickedPos);

    $(audio).on("timeupdate", updateCurrTime);//อัพเดตเวลาในแทร็ก #เอาแทร็กนี้ออกเพลงจะไม่เล่น(ติด buffer)

    playPreviousTrackButton.on("click", function () {//ปุ่มย้อนเพลง และ ปุ่มเพลงถัดไป #เอาออกปุ่มไม่ทำงาน แต่เพลงยังเล่นได้
      selectTrack(-1);
    });
    playNextTrackButton.on("click", function () {
      selectTrack(1);
    });
  }
 initPlayer();
});



