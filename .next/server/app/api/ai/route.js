"use strict";(()=>{var e={};e.id=252,e.ids=[252],e.modules={20399:e=>{e.exports=require("next/dist/compiled/next-server/app-page.runtime.prod.js")},30517:e=>{e.exports=require("next/dist/compiled/next-server/app-route.runtime.prod.js")},30620:(e,t,s)=>{s.r(t),s.d(t,{originalPathname:()=>O,patchFetch:()=>T,requestAsyncStorage:()=>E,routeModule:()=>S,serverHooks:()=>y,staticGenerationAsyncStorage:()=>x});var r={};s.r(r),s.d(r,{POST:()=>R});var o=s(46541),n=s(43026),i=s(70374),a=s(36375);let u=`# Role Definition
You are a professional SVG code modification assistant.

# Core Rules (Must Follow)

## Rule 1: Output Format
- **ONLY output SVG code**, no other content
- **NO markdown formatting**, no code block markers
- **NO explanations, descriptions, or comments**

## Rule 2: Code Integrity
- Must include complete <svg> opening tag
- Must include </svg> closing tag
- All child elements must be properly closed

## Rule 3: Maintain Consistency
- Keep original viewBox and dimensions (unless user explicitly requests change)
- Don't change unrequested parts
- Maintain existing element IDs and structure

## Rule 4: SVG Standards
- Use standard SVG attributes
- Avoid CSS style attributes (except style attribute itself)
- Ensure proper attribute value formatting

## Rule 5: Animation Specification
- Use only SMIL animations (animate, animateTransform)
- NO CSS animations or JavaScript

## Rule 6: Limits
- If SVG code exceeds 8000 chars, output original code
- If request cannot be completed, output original SVG code
- **NEVER output anything other than SVG code**

# Output Examples

✅ Correct Output:
<svg width="200" height="200" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
  <circle cx="100" cy="100" r="50" fill="blue"/>
</svg>

❌ Wrong Output (Don't do this):
Done modifying: <svg>...</svg>

❌ Wrong Output (Don't do this):
Okay, here's the modified code.
<svg>...</svg>

❌ Wrong Output (Don't do this):
\`\`\`svg
<svg>...</svg>
\`\`\`

# Important Reminder
Just write the code directly, no prefix or suffix.
`,l=(e,t,s)=>{let r="";return e.length>0&&(r+=`# Conversation History (Context Only)

`+e.slice(-6).map(e=>`${"user"===e.role?"User":"Assistant"}: ${e.content}`).join("\n")+"\n\n"),r+`# Current SVG Code

${t}

# User Request

${s}

# Output Requirements

Please modify the SVG code based on user request and output ONLY the complete SVG code. No explanations.`},c=e=>{let t=e.trim();if(t.startsWith("<svg"))return g(t);for(let e of[/```(?:\w+)?\n?([\s\S]*?)```/g,/`{3}(\w+)?\n?([\s\S]*?)`{3}/g]){let s;for(;null!==(s=e.exec(t));){let e=(s[2]||s[1]).trim();if(e.includes("<svg")&&e.includes("</svg>"))return g(e)}}if(t.includes("<svg")&&t.includes("</svg>")){let e=t.indexOf("<svg"),s=t.lastIndexOf("</svg>")+6,r=t.substring(e,s);if(r.includes("<svg")&&r.includes("</svg>"))return g(r)}return null},g=e=>{let t=e.match(/<svg[\s>]/);if(!t)return e;let s=e.indexOf(t[0]),r=e.substring(s),o=0,n=!1,i="",a=-1;for(let e=0;e<r.length;e++){let t=r[e];if(('"'===t||"'"===t)&&(0===e||"\\"!==r[e-1])&&(n?t===i&&(n=!1,i=""):(n=!0,i=t)),!n&&"<"===t){if("<!--"===r.substring(e,e+4)){let t=r.indexOf("-->",e);if(-1!==t){e=t+2;continue}}if("</"===r.substring(e,e+2)){if(0==--o){a=e+r.substring(e).indexOf(">")+1;break}}else"!"!==r[e+1]&&o++}}if(-1===a){let e=r.match(/<\/svg>/i);if(!e)return r;a=r.indexOf(e[0])+e[0].length}return r.substring(0,a)},d=e=>{let t=e.replace(/^\uFEFF/,"");return(t=(t=(t=(t=t.replace(/<\?xml[^?]*\?>/gi,"")).replace(/<!DOCTYPE[^>]*>/gi,"")).replace(/<script[\s\S]*?<\/script>/gi,"")).replace(/<!--[\s\S]*?-->/g,"")).trim()},p={MODEL:"deepseek-v4-flash",BASE_URL:"https://api.deepseek.com",TIMEOUT_MS:9e4,MAX_OUTPUT_TOKENS:4096,TEMPERATURE:.3},m=e=>{let t=[];e.includes("<svg")||t.push("No <svg> element found in document"),e.includes("</svg>")||t.push("No </svg> closing tag found");let s=(e.match(/<svg[^>]*>/g)||[]).length,r=(e.match(/<\/svg>/g)||[]).length;return s!==r&&t.push(`Mismatched <svg> tags: ${s} open, ${r} close`),/<script[\s>]/i.test(e)&&t.push("SVG contains script tags (will be auto-removed)"),{isValid:0===t.length,issues:t}},f=e=>m(e),v=process.env.DEEPSEEK_API_KEY||"",h={402:{code:"RATE_LIMIT",suggestion:"Your DeepSeek balance is insufficient. Please top up your account."},429:{code:"RATE_LIMIT",suggestion:"Too many requests. Please wait a moment and try again."},503:{code:"AI_ERROR",suggestion:"DeepSeek service is temporarily unavailable. Please try again later."},Timeout:{code:"TIMEOUT",suggestion:"The AI service took too long to respond. Please try a simpler request."}};async function R(e){try{if(!v)return console.error("DEEPSEEK_API_KEY is not configured"),a.NextResponse.json({success:!1,error:"Service temporarily unavailable",code:"AI_ERROR",suggestion:"Please try again later"},{status:503});let{conversationHistory:t,currentSvgCode:s,userIntent:r}=await e.json();if(!s||!r)return a.NextResponse.json({success:!1,error:"Missing required fields: currentSvgCode or userIntent",code:"AI_ERROR",suggestion:"Please provide SVG code and your request"},{status:400});let o=l(t||[],s,r),n=new AbortController,i=setTimeout(()=>n.abort(),p.TIMEOUT_MS),g=await fetch(`${p.BASE_URL}/chat/completions`,{method:"POST",headers:{"Content-Type":"application/json",Authorization:`Bearer ${v}`},body:JSON.stringify({model:p.MODEL,messages:[{role:"system",content:u},{role:"user",content:o}],temperature:p.TEMPERATURE,max_tokens:p.MAX_OUTPUT_TOKENS}),signal:n.signal});if(clearTimeout(i),!g.ok){let e=String(g.status),t=h[e];if(t)return a.NextResponse.json({success:!1,error:`DeepSeek API returned status ${e}`,code:t.code,suggestion:t.suggestion},{status:g.status});let s="";try{s=await g.text()}catch{}return console.error(`DeepSeek API error (${g.status}):`,s),a.NextResponse.json({success:!1,error:`DeepSeek API error: ${g.status}`,code:"AI_ERROR",suggestion:"Please try again later"},{status:g.status})}let m=await g.json(),R=m.choices?.[0]?.message?.content||"";if(!R)return a.NextResponse.json({success:!1,error:"Empty response from DeepSeek",code:"AI_ERROR",suggestion:"Please try a different request or try again"},{status:500});let S=c(R);if(!S)return a.NextResponse.json({success:!1,error:"Failed to extract SVG from AI response",code:"EXTRACTION_FAILED",suggestion:"Please try a different request",rawResponse:R},{status:500});let E=d(S),x=f(E);if(!x.isValid)return console.error("SVG syntax validation failed:",x.issues),a.NextResponse.json({success:!1,error:"AI generated invalid SVG code",code:"SVG_SYNTAX_ERROR",issues:x.issues,suggestion:"Try simplifying your request",rawResponse:R},{status:500});return a.NextResponse.json({success:!0,svgCode:E,rawResponse:R})}catch(e){if(console.error("AI API error:",e),"AbortError"===e.name)return a.NextResponse.json({success:!1,error:"Request timed out",code:"TIMEOUT",suggestion:"The AI service took too long. Please try a simpler request."},{status:504});return a.NextResponse.json({success:!1,error:"Internal server error",code:"NETWORK_ERROR",suggestion:"Please try again"},{status:500})}}let S=new o.AppRouteRouteModule({definition:{kind:n.x.APP_ROUTE,page:"/api/ai/route",pathname:"/api/ai",filename:"route",bundlePath:"app/api/ai/route"},resolvedPagePath:"/Users/y_sunshine/Documents/svgcodetopng/app/api/ai/route.ts",nextConfigOutput:"",userland:r}),{requestAsyncStorage:E,staticGenerationAsyncStorage:x,serverHooks:y}=S,O="/api/ai/route";function T(){return(0,i.patchFetch)({serverHooks:y,staticGenerationAsyncStorage:x})}}};var t=require("../../../webpack-runtime.js");t.C(e);var s=e=>t(t.s=e),r=t.X(0,[147,651],()=>s(30620));module.exports=r})();