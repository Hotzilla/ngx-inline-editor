import { InlineConfig } from "./types/inline-configs";
import { Events } from "./types/inline-editor-events.class";
import { InlineEditorState } from "./types/inline-editor-state.class";
import { EventEmitter } from "@angular/core";
export declare class InlineEditorService {
    events: Events;
    config: InlineConfig;
    constructor(events: Events, config?: InlineConfig);
    onUpdateStateOfService: EventEmitter<InlineEditorState>;
    private state;
    private subscriptions;
    setConfig(config: InlineConfig): void;
    getConfig(): InlineConfig | undefined;
    getState(): InlineEditorState;
    destroy(): void;
}
