import { App, Editor, MarkdownView, Modal, Notice, ItemView, WorkspaceLeaf, Plugin, PluginSettingTab, Setting } from 'obsidian';

// Remember to rename these classes and interfaces!

interface MyPluginSettings {
	mySetting: string;
	weight1: string;
	weight2: string;
	weight3: string;
	weight4: string;
	weight5: string;
	weight6: string;
}

class SampleModal extends Modal {
	constructor(app: App) {
		super(app);
	}

	onOpen() {
		const {contentEl} = this;
		contentEl.setText('This is a sample modal.');
	}

	onClose() {
		const {contentEl} = this;
		contentEl.empty();
	}
}

const DEFAULT_SETTINGS: MyPluginSettings = {
	mySetting: 'default',
	weight1: '1',
	weight2: '1',
	weight3: '1',
	weight4: '1',
	weight5: '1',
	weight6: '1',
}

export default class HelloWorldPlugin extends Plugin {
	settings: MyPluginSettings;

	async onload() {
		await this.loadSettings();

		console.log('Hellworld Plugin loaded!');
		// This creates an icon in the left ribbon.
		const ribbonIconEl = this.addRibbonIcon('dice', 'Greetings', (evt: MouseEvent) => {
			// Called when the user clicks the icon.
			new Notice('This is a notice!, Hello world');
		});
		// Perform additional things with the ribbon
		ribbonIconEl.addClass('my-plugin-ribbon-class');

		// This adds a status bar item to the bottom of the app. Does not work on mobile apps.
		const statusBarItemEl = this.addStatusBarItem();
		statusBarItemEl.setText('Status Bar Text');

		// This adds a simple command that can be triggered anywhere
		this.addCommand({
			id: 'open-sample-modal-simple',
			name: 'Open sample modal (simple)',
			callback: () => {
				new SampleModal(this.app).open();
			}
		});
		// This adds an editor command that can perform some operation on the current editor instance
		this.addCommand({
			id: 'sample-editor-command',
			name: 'Sample editor command',
			editorCallback: (editor: Editor, view: MarkdownView) => {
				console.log(editor.getSelection());
				editor.replaceSelection('Sample Editor Command');
			}
		});
		// This adds a complex command that can check whether the current state of the app allows execution of the command
		this.addCommand({
			id: 'open-sample-modal-complex',
			name: 'Open sample modal (complex)',
			checkCallback: (checking: boolean) => {
				// Conditions to check
				const markdownView = this.app.workspace.getActiveViewOfType(MarkdownView);
				if (markdownView) {
					// If checking is true, we're simply "checking" if the command can be run.
					// If checking is false, then we want to actually perform the operation.
					if (!checking) {
						new SampleModal(this.app).open();
					}

					// This command will only show up in Command Palette when the check function returns true
					return true;
				}
			}
		});

		// This adds a settings tab so the user can configure various aspects of the plugin
		this.addSettingTab(new SampleSettingTab(this.app, this));
		// here should let user to set the weights of each item

		// Register the side view
		this.registerView(
			SIDE_VIEW_TYPE,
			(leaf) => new SampleSideView(leaf, this)
		);

		// Add a command to open the side view
		this.addCommand({
			id: 'open-sample-side-view',
			name: 'Open Sample Side View',
			callback: () => {
				this.activateView();
				console.log('side view activated')
			}
		});

		// If the plugin hooks up any global DOM events (on parts of the app that doesn't belong to this plugin)
		// Using this function will automatically remove the event listener when this plugin is disabled.
		this.registerDomEvent(document, 'click', (evt: MouseEvent) => {
			console.log('click', evt);
		});

		// When registering intervals, this function will automatically clear the interval when the plugin is disabled.
		this.registerInterval(window.setInterval(() => console.log('setInterval'), 5 * 60 * 1000));
	}

	onunload() {
		this.app.workspace.detachLeavesOfType(SIDE_VIEW_TYPE);
		console.log('Hellworld Plugin unloaded!'); 
	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}

	// async activateView() {
	// 	this.app.workspace.detachLeavesOfType(SIDE_VIEW_TYPE);

	// 	const leaf = this.app.workspace.getRightLeaf(false);
	// 	if (leaf) {
	// 		await leaf.setViewState({
	// 			type: SIDE_VIEW_TYPE,
	// 			active: true,
	// 		});

	// 		this.app.workspace.revealLeaf(
	// 			this.app.workspace.getLeavesOfType(SIDE_VIEW_TYPE)[0]
	// 		);
	// 	}
	// }
	async activateView() {
		const { workspace } = this.app;
	
		let leaf: WorkspaceLeaf | null = null;
		const leaves = workspace.getLeavesOfType(SIDE_VIEW_TYPE);
	
		if (leaves.length > 0) {
		  // A leaf with our view already exists, use that
		  leaf = leaves[0];
		} else {
		  // Our view could not be found in the workspace, create a new leaf
		  // in the right sidebar for it
		  leaf = workspace.getRightLeaf(false);
		  if (leaf) {
			await leaf.setViewState({ type: SIDE_VIEW_TYPE, active: true });
		  }
		}
	
		// "Reveal" the leaf in case it is in a collapsed sidebar
		if (leaf) {
			workspace.revealLeaf(leaf);
		}
	  }
}

const SIDE_VIEW_TYPE = 'sample-side-view';

class SampleSideView extends ItemView {
	plugin: HelloWorldPlugin;

	constructor(leaf: WorkspaceLeaf, plugin: HelloWorldPlugin) {
		super(leaf);
		this.plugin = plugin;
	}

	getViewType() {
		return SIDE_VIEW_TYPE;
	}

	getDisplayText() {
		return 'Sample Side View';
	}

	async onOpen() {
		const {contentEl} = this;
		contentEl.empty();

		const description = document.createElement('p');
		description.textContent = 'Input values for each item:';
		contentEl.appendChild(description);

		const inputs = ['Input 1', 'Input 2', 'Input 3', 'Input 4', 'Input 5', 'Input 6'];
		const input_names = ['Work', 'Sport', 'Study', 'Help', 'Social Act', 'Mood Factor'];
		const input_descriptions = [
			'Work:',
			'Sport:',
			'Study:',
			'Help:',
			'Social Act:',
			'Mood Factor:',

		];
		const inputValues: number[] = [];

		inputs.forEach((input, index) => {
			const inputContainer = document.createElement('div');
			const inputLabel = document.createElement('label');
			inputLabel.textContent = input_descriptions[index];
			const inputEl = document.createElement('input');
			inputEl.type = 'number';
			inputEl.placeholder = input_names[index];
			inputEl.addEventListener('input', () => {
				inputValues[index] = parseFloat(inputEl.value) || 0;
				this.updateResult(inputValues);
			});
			inputContainer.appendChild(inputLabel);
			inputContainer.appendChild(inputEl);
			contentEl.appendChild(inputContainer);
		});

		const resultEl = document.createElement('p');
		resultEl.id = 'result';
		contentEl.appendChild(resultEl);
	}

	updateResult(inputValues: number[]) {
		const weights = [
			parseFloat(this.plugin.settings.weight1),
			parseFloat(this.plugin.settings.weight2),
			parseFloat(this.plugin.settings.weight3),
			parseFloat(this.plugin.settings.weight4),
			parseFloat(this.plugin.settings.weight5),
			parseFloat(this.plugin.settings.weight6),
		];
		const result = inputValues.reduce((sum, value, index) => sum + value * weights[index], 0);
		const resultEl = this.contentEl.querySelector('#result');
		if (resultEl) {
			resultEl.textContent = `Result: ${result}`;
		}
	}

	async onClose() {
		const {contentEl} = this;
		contentEl.empty();
	}
}

// setting
class SampleSettingTab extends PluginSettingTab {
	plugin: HelloWorldPlugin;

	constructor(app: App, plugin: HelloWorldPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const {containerEl} = this;

		containerEl.empty();
		const description = document.createElement('p');
		description.textContent = 'Configure the weights for your reward function below:';
		containerEl.appendChild(description);
		const weights = ['Weight 1', 'Weight 2', 'Weight 3', 'Weight 4', 'Weight 5', 'Weight 6'];
		const weight_names = ['Work', 'Sport', 'Study', 'Help', 'Social Act', 'Mood Factor'];
		
		weights.forEach((weight, index) => {
			new Setting(containerEl)
				.setName(`${weight_names[index]}`)
				// .setDesc(`Set the value for ${weight}`)
				.addText(text => text
					.setPlaceholder('')
					.setValue(this.plugin.settings[`weight${index + 1}` as keyof MyPluginSettings] || '')
					.onChange(async (value) => {
						this.plugin.settings[`weight${index + 1}` as keyof MyPluginSettings] = value;
						await this.plugin.saveSettings();
					}));
		});
	}
}
