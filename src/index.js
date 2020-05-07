'use strict'
let app = WizExplorerApp
let wizWindow = app.Window
let objBrowser = wizWindow.CurrentDocumentBrowserObject
let objWindow = app.Window
let objDocument = objWindow.CurrentDocument
let objCommon = app.CreateWizObject('WizKMControls.WizCommonUI')

let regMatchExt = /[\\\/][^(\\|\/)]+\.((?:jpe?g)|webp|png|gif|webp|bmp|ico)/

// paths
let tempPath = objCommon.GetSpecialFolder('TemporaryFolder')
let documentTempPath = tempPath + objDocument.GUID + '/128/' // e.g. F:\Richex\WizData\temp\209c9d6f-66c7-41eb-a944-670d92c7a2f8/128/
let documentTempIndexFilesPath = documentTempPath + 'index_files/' // e.g. F:\Richex\WizData\temp\209c9d6f-66c7-41eb-a944-670d92c7a2f8/128/index_files/

let imagePaths = []

let html = objDocument.GetHtml()
let newHtml

// Markdown
let MarkdownRegex = /(!\[[^\[]*?\]\()(.+?)(\s+['"][\s\S]*?['"])?(\))/g
newHtml = html.replace(MarkdownRegex, (whole, a, b, c, d) => {
  let src = b
  if (isHttpSrc(b)) src = convertImgSrctoLocal(b)
  imagePaths.push(buildImageTag(documentTempPath + src))
  return a + src + (c || '') + d
})

// html
let HtmlRegex = /(<img.*?src=['"])(.+?)(['"].*?\/?>)/gi
newHtml = newHtml.replace(HtmlRegex, (whole, group1, group2, group3) => {
  group2 = convertImgSrctoLocal(group2)
  imagePaths.push(buildImageTag(documentTempPath + group2))
  return group1 + group2 + group3
})

let uniq = _uniq(imagePaths)

newHtml = newHtml.replace(
  '</body>',
  '<picture_convert style="display: none;">' +
    uniq.join('') +
    '</picture_convert></body>'
)

objDocument.UpdateDocument3(newHtml, 0)
alert('所有网络图片已经下载并转换到本地！')

/**
 * functions
 */

function convertImgSrctoLocal(src) {
  if (!isHttpSrc(src) || ~src.indexOf('www.zhihu.com/equation')) return src

  let match = src.match(regMatchExt)
  let ext = match ? match[1] : 'jpg'

  let saveName = objCommon.URLDownloadToTempFile(src) // e.g. C:\Users\Richex\AppData\Local\Temp\Wiz\c9c3aace-6b3a-402d-b539-85bc3821d006.tmp
  let filename = objCommon.ExtractFileTitle(saveName) + '.' + ext
  let newName = documentTempIndexFilesPath + filename
  objCommon.CopyFile(saveName, newName)
  return 'index_files/' + filename
}

function isHttpSrc(src) {
  return /^https?:\/\//i.test(src)
}

function buildImageTag(src) {
  return '<img src="' + src + '">'
}

function _uniq(arr) {
  let _arr = []
  for (let item of arr) {
    if (!~_arr.indexOf(item)) _arr.push(item)
  }
  return _arr
}
