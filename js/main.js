var headerMargin = 0;

function sizeBg(){
  var bg = document.getElementsByClassName("body-img")[0];
  var introHeight = window.getComputedStyle(document.getElementById("intro")).height;
  introHeight = parseInt(introHeight.substring(0, introHeight.length-2));
  var header = document.getElementsByTagName("header")[0];
  var headerHeight = window.getComputedStyle(header).height;
  headerHeight = parseInt(headerHeight.substring(0, headerHeight.length-2));

  var headerMargin = window.getComputedStyle(header).marginTop;//for tablets
  headerMargin = parseInt(headerMargin.substring(0, headerMargin.length-2));

  var totalHeight = introHeight+ headerHeight + headerMargin;
  bg.style.height = totalHeight+"px";
}

function resizeIntroDiv(){
  intro = document.getElementById("intro");
  if(intro != null){
    header = document.getElementsByTagName("header")[0]
    headerMargin = window.getComputedStyle(header).marginTop
    headerMargin = headerMargin.substring(0, headerMargin.length-2)
    headerHeight = window.getComputedStyle(header).height
    headerHeight = headerHeight.substring(0, headerHeight.length-2)

    setIntroDivHeight(intro, window.innerHeight-headerMargin - headerHeight);
  }
}

var vidRatio = 16/9;
function resizeBgVideo(){
  var vid = document.getElementById("share-video");
  if(vid != null){
    var pageHeight = window.innerHeight;
    var pageWidth = window.innerWidth;
    if((pageWidth/pageHeight) > vidRatio){//ratio is wider than 16:9
      vid.style.width = "100%";
      vid.style.height = "auto";
      vid.style.marginLeft = "0";
    }else{
      var widthOfVideoAtHeight = pageHeight * vidRatio;
      var videoOverflow = widthOfVideoAtHeight - pageWidth;
      var newMargin = -(videoOverflow/2);
      vid.style.width = "auto";
      vid.style.height = "100%";
      vid.style.marginLeft = -(videoOverflow/2)+"px";
    }
  }
}

function setIntroDivHeight(div, height){
  div.style.height = height+"px";
}

greetings = [
  "Hi",
  "Hello",
  "Greetings",
  "👋",
  "你好",
  "Hallå där",
  "Bonjour",
  "Hola",
  "Hallo"
]

function changeGreeting(){
  //for a later time
}

window.bringIntoView_started = 0;

window.bringIntoView_ends = 0;

window.bringIntoView_y = 0;

window.bringIntoView_tick = function() {
    var distanceLeft, dt, duration, t, travel;
    t = Date.now();
    if (t < window.bringIntoView_ends) {
      dt = t - window.bringIntoView_started;
      duration = window.bringIntoView_ends - window.bringIntoView_started;
      distanceLeft = window.bringIntoView_y - document.body.scrollTop;
      if (Math.abs(distanceLeft) < 1) {
        return document.body.scrollTop = window.bringIntoView_y;
      } else {
        travel = distanceLeft * (dt / duration);
        console.log('%f => %f (%f) dt=%f / %f (%f)', document.body.scrollTop, window.bringIntoView_y, travel, dt, duration, dt / duration);
        document.body.scrollTop += travel;
        return window.requestAnimationFrame(window.bringIntoView_tick);
      }
    } else {
      return document.body.scrollTop = window.bringIntoView_y;
    }
  };

window.bringIntoView = function(e, duration) {
    window.bringIntoView_started = Date.now();
    window.bringIntoView_ends = window.bringIntoView_started + duration;
    window.bringIntoView_y = Math.min(document.body.scrollTop + e.getBoundingClientRect().top, document.body.scrollHeight - window.innerHeight);
    console.log(document.body.scrollTop + e.getBoundingClientRect().top, document.body.scrollHeight, window.bringIntoView_y);
    return window.requestAnimationFrame(window.bringIntoView_tick);
  };
