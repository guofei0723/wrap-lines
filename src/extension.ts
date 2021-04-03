// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

  // Use the console to output diagnostic information (console.log) and errors (console.error)
  // This line of code will only be executed once when your extension is activated
  console.log('Congratulations, your extension "wrap-lines" is now active!');

  // The command has been defined in the package.json file
  // Now provide the implementation of the command with registerCommand
  // The commandId parameter must match the command field in package.json
  let disposable = vscode.commands.registerCommand('wrap-lines.helloWorld', () => {
    // The code you place here will be executed every time your command is executed

    // Display a message box to the user
    vscode.window.showInformationMessage('Hello World from wrap-lines!');
  });

  context.subscriptions.push(disposable);

  // 添加折行命令
  context.subscriptions.push(vscode.commands.registerCommand('wrap-lines.wrapline', () => {
    // 拿到当前活动的编辑器
    const editor = vscode.window.activeTextEditor;

    // 当前可能没有活动的编辑器，所以要判断
    if (editor) {
      // 我们要修改的目标内容
      let text = '';
      // 如果当前没有选择文本内容则在当前行查找，否则使用当前选择的内容
      if (editor.selection.isEmpty) {
        // 光标在编辑器中的位置
        const position = editor.selection.active;
        // 获取当前行的文本内容
        text = editor.document.lineAt(position.line).text;
      } else {
        // 获取选中的内容
        text = editor.document.getText(editor.selection);
      }
      // 显示内容，以便调度
      vscode.window.showInformationMessage(`将要被修改的内容:${text}`);

      // 解析出标签内容
      const content = text.match(/<\w+(\s+\w+(="[^"]*")*)*\s*\/?>/);
      if (content) {
        const markText = content[0];
        // 文本在该行的起始位置
        let startCharPos = content.index || 0;
        // 如果是选择的内容，则在选中的范围内找到标签所在行的起始位置
        if (!editor.selection.isEmpty) {
          // 拆分成行
          const lines = text.split('\n');
          // 标签所在行之前的行的内容总长度
          let beforeStart = 0;
          for (const l of lines) {
            // 加上该行的长度，由于换行符也会占一个位置所以需要加上1
            beforeStart += l.length + 1;
            // 如果标签在当前行
            if (beforeStart > startCharPos) {
              // 减掉当前行的长度
              beforeStart = beforeStart - l.length - 1;
              break;
            }
          }
          // 如果标签在第一行，则标签在当前行的位置需要加上选择范围的起始位置
          if (beforeStart === 0) {
            startCharPos += editor.selection.start.character;
          } else { // 否则，直接减去前面所有行的总长
            startCharPos -= beforeStart;
          }
        }
        // 缩进字符
        const indentChar = editor.options.insertSpaces
          // 使用空格做缩进，
          ? Array(editor.options.tabSize).fill(' ').join('')
          // 使用tab缩进
          : '\t';
        // 当前行的缩进
        const prevIndent = Array(startCharPos).fill(indentChar[0]).join('');

        // 将所有属性折行
        let result = markText.replace(/\s+\w+(="[^"]*")*/g, (m) => {
          // 打印出被换行的属性以便调试
          console.log('replace: ', m);
          // 替换成换行的属性
          return `\n${prevIndent}${indentChar}${m.trim()}`;
        });
        // 换行关闭标签
        result = result.replace(/\s*\/?>$/, (m) => `\n${prevIndent}${m.trim()}`);
        // 显示结果
        console.log(`被修改后：\n${result}`);

        // 最终被替换的结果
        result = text.replace(markText, result);

        // 最终编辑器中会被替换的范围
        let range: vscode.Range;
        if (editor.selection.isEmpty) {
          // 行数
          const line = editor.selection.active.line;
          range = new vscode.Range(line, 0, line, text.length);
        } else {
          range = editor.selection;
        }

        // 写入编辑器
        editor.edit(editBuilder => editBuilder.replace(range, result));
      } else {
        console.log('未找到标签内容');
      }
    } else {
      // 没有编辑器时显示的提示信息
      vscode.window.showErrorMessage('你应该在编辑器中执行该命令');
    }
  }));
}

// this method is called when your extension is deactivated
export function deactivate() {}
