import * as vscode from 'vscode';
import { ElasticMatch } from './ElasticMatch'

export function UpdateDecoration(editor: vscode.TextEditor): ElasticMatch[] {

    if (!editor) {
        console.error("updateDecorations(): no active text editor.");
        return [];
    }

    var host = this.context.workspaceState.get("elastic.host", "localhost:9200")

    var eMatches: ElasticMatch[] = []

    var highlight = vscode.window.createTextEditorDecorationType({
        color: 'rgb(0,200,100)',
        light: {
            after: { contentText: ' • ' + host, color: 'lightgray' }
        },
        dark: {
            after: { contentText: ' • ' + host, color: 'gray' }
        }
    });

    var bHighlight = vscode.window.createTextEditorDecorationType({
        isWholeLine: true,
        gutterIconPath: this.context.asAbsolutePath("./media/gutter.svg"),//vscode.Uri.parse('data:image/svg+xml;base64,PHN2ZyB4b+'),
        gutterIconSize: 'contain',

        light: {
            backgroundColor: 'rgba(180,180,200,0.1)'
        },
        dark: {
            backgroundColor: 'rgba(50,50,50,0.1)'
        }
    });

    var mHighlight = vscode.window.createTextEditorDecorationType({
        color: 'rgb(255,100,100)',
        overviewRulerColor: 'blue',
        overviewRulerLane: vscode.OverviewRulerLane.Full
    });

    var errHighlight = vscode.window.createTextEditorDecorationType({
        borderWidth: '1px',
        borderStyle: 'solid',
        light:
        {
            borderColor: 'rgba(255,0,0,0.5)',
            backgroundColor: 'rgba(255,0,0,0.25)'
        },
        dark:
        {
            borderColor: 'rgba(255,0,0,0.5)',
            backgroundColor: 'rgba(255,0,0,0.25)'
        }
    });

    var decor: vscode.DecorationOptions[] = [];

    editor.setDecorations(highlight, decor);
    editor.setDecorations(mHighlight, decor);
    editor.setDecorations(errHighlight, decor);
    editor.setDecorations(bHighlight, decor);

    editor.options

    var vir = false

    for (var i = 0; i < editor.document.lineCount; i++) {
        var line = editor.document.lineAt(i);
        var tl = line.text.trim()

        if (vir && tl.startsWith('{')) {
            eMatches[eMatches.length - 1].HasBody = true
        }

        vir = false


        // https://stackoverflow.com/a/1547940/1495442
        var regexp = /^(GET|POST|DELETE|PUT|OPTIONS|PATCH|HEAD)\s+([A-Za-z0-9\-._~:\/#\[\]@!$&'\(\)\*+,;=`]+$)/gim;
        var match = regexp.exec(line.text);

        if (match != null) {
            let lrange = new vscode.Range(i, match[1].length + 1, i, line.text.length);
            let mrange = new vscode.Range(i, 0, i, match[1].length);
            let em = new ElasticMatch({ Text: match[1], Range: mrange });

            em.Path = { Text: match[2], Range: lrange }

            vir = true

            eMatches.push(em)
        }
    }

    editor.setDecorations(mHighlight, eMatches.map(m => m.Method.Range).filter(x => !!x));
    editor.setDecorations(highlight, eMatches.map(p => p.Path.Range).filter(x => !!x));
    editor.setDecorations(bHighlight, eMatches.map(b => b.Body.Range).filter(x => !!x));
    editor.setDecorations(errHighlight, eMatches.map(e => e.Error.Range).filter(x => !!x));

    return eMatches

}