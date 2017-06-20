export interface InlineEditorStateOptions {
    value: any;
    editing?: boolean;
    disabled?: boolean;
    empty?: boolean;
    name: string;
}
export declare class InlineEditorState {
    constructor({value, disabled, editing, empty, name}?: InlineEditorStateOptions);
    private empty;
    private value;
    private disabled;
    private editing;
    private name;
    newState(state: InlineEditorState | InlineEditorStateOptions): InlineEditorState;
    getState(): InlineEditorStateOptions;
    clone(): InlineEditorState;
    isEmpty(): boolean;
    isEditing(): boolean;
    isDisabled(): boolean;
}
