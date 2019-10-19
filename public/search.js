const URL = "http://192.168.0.107";

var count = 50;
var search = "";
var next = 0;
var prev = -count;

const nextButtons = document.querySelectorAll("#next");
const prevButtons = document.querySelectorAll("#prev");

document.getElementById("search").addEventListener("click", e => {
  e.preventDefault();
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
      next = offset + Math.min(json.totalResults, count);
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
    return `<img src="${src}">`;
  } else if (isVideo(filename)) {
    return `<video width="320" height="240" controls>
    <source src="${src}#t=15" type="video/mp4">
  </video>`;
  }
};

const addResult = result => {
  let tableRef = document.querySelector("#results").querySelector("tbody");
  let newRow = tableRef.insertRow();

  let path = `${URL}/${result.path.split("\\").join("/")}`;
  let src = path + "/" + result.name;
  let a = document.createElement("a");
  a.setAttribute("href", src);
  a.setAttribute("target", "_blank");
  // a.innerHTML = `<img src="${src}">`;
  a.innerHTML = getFileTag(result.name, src);

  newRow.insertCell(0).appendChild(a);

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
      nextButton.style.display = "inline-block";
    });
  } else {
    nextButtons.forEach(nextButton => {
      nextButton.style.display = "none";
    });
  }
  if (prev >= 0) {
    prevButtons.forEach(prevButton => {
      prevButton.style.display = "inline-block";
    });
  } else {
    prevButtons.forEach(prevButton => {
      prevButton.style.display = "none";
    });
  }
  results.results.forEach(result => addResult(result));
};

document.querySelector("#searchText").addEventListener("keyup", event => {
  if (event.key !== "Enter") return; // Use `.key` instead.
  document.querySelector("#search").click(); // Things you want to do.
  event.preventDefault(); // No need to `return false;`.
});
