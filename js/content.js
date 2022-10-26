console.log("content script");

var access_token = localStorage.getItem("auth-accessToken");
var refreshToken = localStorage.getItem("auth-refreshToken");

console.log(access_token);

if (access_token) {
  chrome.runtime.sendMessage({
    action: "login",
    access_token: access_token,
    refreshToken: refreshToken
  });
} else {
  chrome.runtime.sendMessage({ action: "relogin" });
  console.log("no access_token");
}
