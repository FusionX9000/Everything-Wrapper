const URL = "http://192.168.0.107";

var count = 50;
var search = "";
var next = 0;
var prev = -count;

const nextButtons = document.querySelectorAll("#next");
const prevButtons = document.querySelectorAll("#prev");
const countHeader = document.querySelector("#count");

document.getElementById("search").addEventListener("click", e => {
  e.preventDefault();
  countHeader.style.display = "block";
  search = document.getElementById("searchText").value;

  getResults(`${URL}:5000`, search, count, 0, results => {
    console.log(results);
    setResults(results);
  });
});

nextButtons.forEach(nextButton => {
  nextButton.addEventListener("click", e => {
    e.preventDefault();
    getResults(`${URL}:5000`, search, count, next, results => {
      console.log(results);
      setResults(results);
    });
  });
});

prevButtons.forEach(prevButton => {
  prevButton.addEventListener("click", e => {
    e.preventDefault();
    getResults(`${URL}:5000`, search, count, prev, results => {
      console.log(results);
      setResults(results);
    });
  });
});

const getResults = (url, search, count, offset, cb) => {
  url = `${url}/?s=${search}&j=1&path_column=1&size_column=1&date_modified_column=1&date_created_column=1&attributes_column=1&c=${count}&o=${offset}`;
  fetch(url)
    .then(res => {
      return res.json();
    })
    .then(json => {
      prev = offset - count;
      next = Math.min(json.totalResults,offset + count);
      countHeader.innerText = `${next} out of ${json.totalResults} results`;
      cb({
        results: json.results,
        totalCount: json.totalResults,
        next: next,
        prev: prev
      });
    });
};

const isVideo = filename => {
  if (
    filename.endsWith(".mp4") ||
    filename.endsWith(".mkv") ||
    filename.endsWith(".webm") ||
    filename.endsWith(".avi") ||
    filename.endsWith(".ts")
  ) {
    return true;
  }
};

const isImage = filename => {
  if (
    filename.endsWith(".jpg") ||
    filename.endsWith(".jpeg") ||
    filename.endsWith(".gif") ||
    filename.endsWith(".png") ||
    filename.endsWith(".tiff") ||
    filename.endsWith(".bmp")
  ) {
    return true;
  }
};

const getFileTag = (filename, src) => {
  if (isImage(filename)) {
    let a = document.createElement("a");
    a.setAttribute("href", src);
    a.setAttribute("target", "_blank");
    a.innerHTML = `<img src="${src}">`
    return a;
  } else if (isVideo(filename)) {
    let video = document.createElement("video");
    video.setAttribute("width", 320);
    video.setAttribute("height", 240);
    video.setAttribute("loop", '');
    video.setAttribute("controls", '');
    video.innerHTML = `<source src="${src}#t=0.1" type="video/mp4">`;
    return video;
  } else {
    return undefined;
  }
};

const addResult = result => {
  let tableRef = document.querySelector("#results").querySelector("tbody");

  let path = `${URL}/${result.path.split("\\").join("/")}`;
  let src = path + "/" + result.name;

  var fileHTML = getFileTag(result.name, src);
  if (fileHTML === undefined) return;

  let newRow = tableRef.insertRow();
  newRow.insertCell(0).appendChild(fileHTML);

  a = document.createElement("a");
  a.setAttribute("href", path);
  a.setAttribute("target", "_blank");
  a.innerText = path;
  newRow.insertCell(1).appendChild(a);

  let date = parseInt(result.date_modified);
  let utc = new Date(date).toLocaleString();

  newRow.insertCell(2).appendChild(document.createTextNode(utc));

  newRow
    .insertCell(3)
    .appendChild(
      document.createTextNode(Math.round(parseInt(result.size) / 1024) + " KB")
    );
};

const setResults = results => {
  document.querySelector("tbody").innerHTML = "";
  if (next >= count && next < results.totalCount) {
    nextButtons.forEach(nextButton => {
      nextButton.style.visibility = "visible";
    });
  } else {
    nextButtons.forEach(nextButton => {
      nextButton.style.visibility = "hidden";
    });
  }
  if (prev >= 0) {
    prevButtons.forEach(prevButton => {
      prevButton.style.visibility = "visible";
    });
  } else {
    prevButtons.forEach(prevButton => {
      prevButton.style.visibility = "hidden";
    });
  }
  results.results.forEach(result => addResult(result));
};

document.querySelector("#searchText").addEventListener("keyup", event => {
  if (event.key !== "Enter") return; // Use `.key` instead.
  document.querySelector("#search").click(); // Things you want to do.
  event.preventDefault(); // No need to `return false;`.
});
