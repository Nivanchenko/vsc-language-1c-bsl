import * as path from "path";
import "should";
import * as vscode from "vscode";

import { addText, fixturePath, newTextDocument } from "./helpers";

import { Global } from "../src/global";
import * as vscAdapter from "../src/vscAdapter";

const globals = Global.create(vscAdapter);

let textDocument: vscode.TextDocument;

describe("Definitions", () => {

    before(async function () {
        this.timeout(10000);
        const uriEmptyFile = vscode.Uri.file(
            path.join(fixturePath, "emptyFile.bsl")
        );
        textDocument = await newTextDocument(uriEmptyFile);
        await globals.waitForCacheUpdate();
    });

    beforeEach(async () => {
        await vscode.window.activeTextEditor.edit((editBuilder: vscode.TextEditorEdit) => {
            const range = new vscode.Range(new vscode.Position(0, 0), vscode.window.activeTextEditor.selection.anchor);
            editBuilder.delete(range);
        });
    });

    it("should be available on manager's module call", async () => {

        await addText("Документы.Definition.ПроцедураМодуляМенеджера");

        const position = vscode.window.activeTextEditor.selection.anchor;

        const locations = await vscode.commands.executeCommand<vscode.Location[]>(
            "vscode.executeDefinitionProvider",
            textDocument.uri,
            position
        );

        locations.should.have.length(1);

        let location = locations[0];
        location.uri.path.should.endWith("Documents/Definition/Ext/ManagerModule.bsl");

    });

    it("should not crash on find only non-public methods", async () => {

        await addText("НеЭкспортная");

        const position = vscode.window.activeTextEditor.selection.anchor;

        const locations = await vscode.commands.executeCommand<vscode.Location[]>(
            "vscode.executeDefinitionProvider",
            textDocument.uri,
            position
        );

        locations.should.have.length(0);

    });

    it("should not open global functions", async () => {

        await addText("Сообщить");

        const position = vscode.window.activeTextEditor.selection.anchor;

        const locations = await vscode.commands.executeCommand<vscode.Location[]>(
            "vscode.executeDefinitionProvider",
            textDocument.uri,
            position
        );

        locations.should.have.length(0);

    });

});