"use strict";
let app = WizExplorerApp;
// let wizWindow = app.Window;
// let objBrowser = wizWindow.CurrentDocumentBrowserObject
let objWindow = app.Window;
let objDocument = objWindow.CurrentDocument;
let objCommon = app.CreateWizObject("WizKMControls.WizCommonUI");

// paths
let tempPath = objCommon.GetSpecialFolder("TemporaryFolder");
let documentTempPath = tempPath + objDocument.GUID + '/128/'; // e.g. F:\Richex\WizData\temp\209c9d6f-66c7-41eb-a944-670d92c7a2f8/128/
let documentTempIndexFilesPath = documentTempPath + 'index_files/'; // e.g. F:\Richex\WizData\temp\209c9d6f-66c7-41eb-a944-670d92c7a2f8/128/index_files/


let imagePaths = [];

let html = objDocument.GetHtml();
let newHtml;
console.log(html);

// Markdown
let MarkdownRegex = /(!\[[^\[]*?\]\()(.+?)(\s+['"][\s\S]*?['"])?(\))/g;
newHtml = html.replace(MarkdownRegex, (whole, a, b, c, d) => {
  let src = b;
  if (isHttpSrc(b)) src = convertImgSrctoLocal(b);
  imagePaths.push(buildImageTag(documentTempPath + src));
  return a + src + (c || '') + d;
});

// html
let HtmlRegex = /<img.*src=['"](.*?)['"].*?\/?>/gi;
newHtml = newHtml.replace(HtmlRegex, (whole, a) => {
  let src = a;
  if (isHttpSrc(a)) src = convertImgSrctoLocal(a);

  imagePaths.push(buildImageTag(documentTempPath + src));
  return src;
});

console.log(imagePaths);
let uniq = _uniq(imagePaths);
console.log(uniq);

newHtml = newHtml.replace('</body>', '<picture_convert style="display: none;">' + uniq.join('') + '</picture_convert></body>');
console.log(newHtml);

objDocument.UpdateDocument3(newHtml, 0);
alert('所有网络图片已经下载并转换到本地！');



function convertImgSrctoLocal(src) {
  if (!isHttpSrc(src)) return src;

  let ext = objCommon.ExtractFileExt(src);
  let saveName = objCommon.URLDownloadToTempFile(src); // e.g. C:\Users\Richex\AppData\Local\Temp\Wiz\c9c3aace-6b3a-402d-b539-85bc3821d006.tmp
  let filename = objCommon.ExtractFileTitle(saveName) + ext;
  let newName = documentTempIndexFilesPath + filename;
  objCommon.CopyFile(saveName, newName);
  return 'index_files/' + filename;
}

function isHttpSrc(src) {
  return /^https?:\/\//i.test(src);
}

function buildImageTag(src) {
  return '<img src="' + src + '">';
}

function _uniq(arr) {
  let _arr = [];
  for (let item of arr) {
    if (!~_arr.indexOf(item)) _arr.push(item);
  }
  return _arr;
}

// var pluginPath = app.GetPluginPathByScriptFileName('index.js')
// var path = pluginPath + 'content.js'

// wizBrowser.ExecuteScriptFile(path, res => {
//   wizBrowser.ExecuteFunction2('PictureLocalInit', app, wizBrowser)
// })

// wizBrowser.ExecuteScript('document.body.innerHTML', text => {
//   alert(text);
//   console.log(document)
// })

// wizBrowser.ExecuteScript('console.log(document.body.innerHTML)', doc => {
//   wizBrowser.ExecuteScript('')
// })
