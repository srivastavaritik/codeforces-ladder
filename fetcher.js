document.write(`<!-- Global site tag (gtag.js) - Google Analytics -->
<script async src="https://www.googletagmanager.com/gtag/js?id=UA-132341920-2"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());

  gtag('config', 'UA-132341920-2');
</script>
`)

page_data = {}

function setCookie(cname, cvalue, exdays) {
  var d = new Date()
  d.setTime(d.getTime() + exdays * 24 * 60 * 60 * 1000)
  var expires = 'expires=' + d.toUTCString()
  document.cookie = cname + '=' + cvalue + ';' + expires + ';path=/'
}

function getCookie(cname) {
  var name = cname + '='
  var decodedCookie = decodeURIComponent(document.cookie)
  var ca = decodedCookie.split(';')
  for (var i = 0; i < ca.length; i++) {
    var c = ca[i]
    while (c.charAt(0) == ' ') {
      c = c.substring(1)
    }
    if (c.indexOf(name) == 0) {
      return c.substring(name.length, c.length)
    }
  }
  return ''
}
function changeUser() {
  setCookie('cf_username', '', 1000)
  window.location.reload()
}

document.write(`<div class="user-button" style=\"padding: 0.5rem;
color: white;
background: #1d0b34;
box-shadow: 1px 1px 2px black;
width: 100%;
position: inherit;
margin-bottom: 1rem;
    font-family: 'Rubik Vinyl', cursive;
	display:flex;
	justify-content:space-around;\"><span id="cf_username">${getCookie(
    'cf_username',
  )}</span><br><span><a href="index.html">Home</a></span><br><button onclick=\"changeUser()\"> Change User </button></div>`)

function loadScript(url, callback) {
  var script = document.createElement('script')
  script.type = 'text/javascript'

  if (script.readyState) {
    //IE
    script.onreadystatechange = function () {
      if (script.readyState == 'loaded' || script.readyState == 'complete') {
        script.onreadystatechange = null
        callback()
      }
    }
  } else {
    //Others
    script.onload = function () {
      callback()
    }
  }

  script.src = url
  document.getElementsByTagName('head')[0].appendChild(script)
}

function updatePage() {
  let username = getCookie('cf_username')
  let page = this.location.href.substring(
    this.location.href.lastIndexOf('/') + 1,
  )

  $('#cf_username').html(username)
  let url = `https://codeforces.com/api/user.status?handle=${username}`
  $.getJSON(url, (data, status) => {
    console.log(page)
    let solved = new Set()
    for (let item of data.result) {
      if (item.verdict != 'OK') continue
      solved.add(
        `http://codeforces.com/problemset/problem/${item.problem.contestId}/${item.problem.index}`,
      )
    }
    if (page === 'Ladders.html' || page === 'index.html') {
      let links = page_data['Ladders.html']

      for (let item of links) {
        let solved_count = 0
        for (let problem_link of page_data[item]) {
          if (solved.has(problem_link)) {
            solved_count += 1
          }
        }
        let text = $(`td > a[href="${item}"]`).parent().html()
        let solved_percent = Math.floor(
          (solved_count * 100) / page_data[item].length,
        )
        $(`td > a[href="${item}"]`).parent()
          .html(`<div style="margin-left: -5px;
padding-left: 2px;
margin-top: -5px;
position: absolute;
z-index: -1;
background-color: #28567869;
float: left;
height: 28px;
width: 9%;
font-size: 8px;
text-align: left;width:${solved_percent}%;font-size:8px;text-align:left;">${solved_count}</div> ${text}</div>`)
        console.log(solved_percent)
      }
    } else {
      for (let element of $('td > a')) {
        if (solved.has($(element).attr('href'))) {
          $(element).parent().parent().css('background-color', '#203a01')
        }
      }
    }
  })
}

function startService() {
  let problem_tree = './data.json'
  $.getJSON(problem_tree, (data, status) => {
    page_data = data
    updatePage()
    setInterval(updatePage, 60000)
  })
}
function validateUsername(username) {
  let url = `https://codeforces.com/api/user.info?handles=${username}`
  let timer = setTimeout(() => {
    username = prompt('Some error while setting username, please re-enter')
    validateUsername(username)
  }, 5000)
  gtag('set', { user_id: username })
  $.getJSON(url, (data, status) => {
    console.log(data, status)
    clearInterval(timer)
    setCookie('cf_username', username, 1)
    startService()
  })
}

loadScript('https://code.jquery.com/jquery-3.4.1.min.js', () => {
  $(document).ready(function () {
    let username = getCookie('cf_username')
    if (!username) {
      username = prompt('No username is set,Enter your codeforces username')
      validateUsername(username)
    } else {
      startService()
    }
  })
})
