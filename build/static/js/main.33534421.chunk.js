(this["webpackJsonpmy-app"]=this["webpackJsonpmy-app"]||[]).push([[0],[,,,,,,function(t,e,n){t.exports=n.p+"static/media/logo.5d5d9eef.svg"},,function(t,e,n){t.exports=n(16)},,,,,function(t,e,n){},,function(t,e,n){},function(t,e,n){"use strict";n.r(e);var a=n(0),o=n.n(a),r=n(4),c=n.n(r),i=(n(13),n(2)),s=n.n(i),u=n(5),l=n(7),p=n(1),f=n(6),m=n.n(f),d=(n(15),function(t){return o.a.createElement(o.a.Fragment,null,"Wealthica Options: ",JSON.stringify(t.options))}),h={addon:new(0,window.Addon)},g=function(t,e,n){return function(t,e,n){var a=new URL(t);return a.search=new URLSearchParams(e).toString(),fetch(a.toString(),n).then((function(t){return t.json()}))}(t,n,{headers:{authorization:"Bearer ".concat(e)}})},w=function(t){return g("https://app.wealthica.com/api/positions",t.token,{groups:t.groupsFilter,institutions:t.institutionsFilter,investments:t.investmentsFilter})},b=function(){var t=Object(a.useState)(!1),e=Object(p.a)(t,2),n=e[0],r=e[1],c=Object(a.useState)(),i=Object(p.a)(c,2),f=i[0],g=i[1],b=Object(a.useState)([]),v=Object(p.a)(b,2),E=v[0],O=v[1];return Object(a.useEffect)((function(){n||(r(!0),h.addon.on("init",(function(t){g(t),console.log("init",t)})),h.addon.on("update",(function(t){g((function(e){return Object(l.a)({},e,{},t)})),console.log("update",t)})))}),[n]),Object(a.useEffect)((function(){(function(){var t=Object(u.a)(s.a.mark((function t(){var e;return s.a.wrap((function(t){for(;;)switch(t.prev=t.next){case 0:if(!f){t.next=5;break}return t.next=3,w(f);case 3:e=t.sent,O(e);case 5:case"end":return t.stop()}}),t)})));return function(){return t.apply(this,arguments)}})()()}),[f]),o.a.createElement("div",{className:"App"},o.a.createElement("header",{className:"App-header"},o.a.createElement("img",{src:m.a,className:"App-logo",alt:"logo"})),f&&o.a.createElement(d,{options:f}),o.a.createElement("h1",null,"Positions:"),o.a.createElement("ul",null,E.map((function(t){return o.a.createElement("li",null,"".concat(t.security.symbol,": ").concat(t.quantity))}))))};Boolean("localhost"===window.location.hostname||"[::1]"===window.location.hostname||window.location.hostname.match(/^127(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}$/));c.a.render(o.a.createElement(o.a.StrictMode,null,o.a.createElement(b,null)),document.getElementById("root")),"serviceWorker"in navigator&&navigator.serviceWorker.ready.then((function(t){t.unregister()})).catch((function(t){console.error(t.message)}))}],[[8,1,2]]]);
//# sourceMappingURL=main.33534421.chunk.js.map