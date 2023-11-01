Main: {
    document.addEventListener(`DOMContentLoaded`, () => {
        const u: { d?: boolean, p?: (s: string) => void, w?: (s: string) => void } = {};
        utility: {
            function log(s: string): void {
                if (u.d) console.log(s);
            }
            function warn(s: string): void {
                if (u.d) console.warn(s);
            }
            Object.defineProperty(u, `d`, {
                value: false,
                enumerable: true,
                writable: true,
                configurable: false
            });
            Object.defineProperty(u, `p`, {
                value: log,
                enumerable: true,
                writable: false,
                configurable: false
            });
            Object.defineProperty(u, `w`, {
                value: warn,
                enumerable: true,
                writable: false,
                configurable: false
            });
            Object.seal(u);

            u?.p?.(`LOADING EVENT: added utility`);
        }

        const ui = {};
        FormBinding: {
            const uiForm = (document.forms as HTMLCollectionOf<HTMLFormElement> & { ui: HTMLFormElement }).ui;

            listen: {
                function setHashToUI(): void {
                    u?.p?.(`UI: set hash to ui`);
                    const formData = new FormData(uiForm);
                    const entries = Array.from(formData.entries());
                    const onbect = Object.fromEntries(entries);
                    const json = JSON.stringify(onbect);
                    const base64 = btoa(json);
                    window.location.hash = `#${base64}`;
                }
                uiForm.addEventListener(`change`, setHashToUI);

                u?.p?.(`LOADING EVENT: added form change listener`);
            }

            object: {
                const keys = Array.from((new FormData(uiForm)).keys());
                for (const key of keys) {
                    function get(): string | undefined {
                        u?.p?.(`UI: get ${key}`);
                        const formData: FormData = new FormData(uiForm);
                        const value: FormDataEntryValue | null = formData.get(key);
                        if (value === null) {
                            u?.w?.(`ERROR: failed to get value for key: ${key}`);
                            return undefined;
                        }
                        return value.toString();
                    }
                    function set(value: string): void {
                        u?.p?.(`UI: set ${key} to ${value}`);
                        try {
                            u?.p?.(`UI: set hash to ui`);
                            window.location.hash = btoa(JSON.stringify(ui));
                        }
                        catch {
                            u?.w?.(`ERROR: failed to set hash to ui`);
                            window.location.hash = `#`;
                        }
                        const radio: Element | null = document.querySelector(
                            `[type="radio"][name="${key}"][value="${value}"]`
                        );
                        if (radio !== null) return (radio as HTMLInputElement).click();

                        const check: Element | null = document.querySelector(
                            `[type="checkbox"][name="${key}"]`
                        );
                        if (check !== null) return (check as HTMLInputElement).click();

                        document.querySelector(`[name="${key}"]`)?.setAttribute(`value`, value);
                    }
                    Object.defineProperty(ui, key, {
                        get: get,
                        set: set,
                        enumerable: true,
                        configurable: false
                    });
                }
                Object.freeze(ui);
                try {
                    u?.p?.(`UI: set ui to hash`);
                    Object.assign(ui, JSON.parse(atob(window.location.hash.slice(1))));
                } catch {
                    u?.w?.(`ERROR: failed to set ui to hash`);
                    window.location.hash = `#`;
                };
            }

            u?.p?.(`LOADING EVENT: added form binding`);
        }
        const reader: { svg?: (callback: (name: string, data: string) => any) => Promise<void> } = {};
        readerWorker: {
            const callbacks: Map<string, (name: string, data: string) => any> = new Map();
            let worker: Worker
            try {
                const elem: Element | null = document.querySelector("script[type='text\/js-worker']");
                if (elem === null) {
                    u?.w?.(`ERROR: failed to add worker: no script[type='text\/js-worker']`);
                    break readerWorker;
                }
                const blob: Blob = new Blob(
                    [elem.textContent as string],
                    { type: "text/javascript" },
                );
                const url: string = window.URL.createObjectURL(blob);
                worker = new Worker(url);
            }
            catch {
                u?.w?.(`ERROR: failed to add worker`);
                break readerWorker;
            }
            worker: {
                function onmessage({ data }: { data: Map<string, string> }): void {
                    u?.p?.(`FILE: onmessage`);
                    const entry: IteratorResult<[String, String] | undefined> = data.entries().next();
                    if (entry.done) return u?.w?.(`ERROR: failed to add worker: no entry`);
                    const value: [String, String] | undefined = entry.value;
                    if (value === undefined) return u?.w?.(`ERROR: failed to add worker: no value`);
                    const [name, text]: [string, string] = value as [string, string];
                    const callback: ((name: string, data: string) => any) | undefined = callbacks.get(name);
                    if (callback === undefined) return u?.w?.(`ERROR: failed to add worker: no callback`);
                    callbacks.delete(name);
                    callback(name, text);
                }
                worker.addEventListener("message", onmessage);
                Object.freeze(worker);

                u?.p?.(`LOADING EVENT: added worker`);
            }

            reader: {
                async function open(): Promise<FileSystemFileHandle | undefined> {
                    u?.p?.(`FILE: open`);
                    const files: FileSystemFileHandle[] = await window.showOpenFilePicker({
                        multiple: false,
                        types: [{ description: `SVG Files`, accept: { 'image/svg+xml': [`.svg`] } }]
                    });
                    return files.pop();
                }
                async function read(callback: (name: string, data: string) => any): Promise<void> {
                    u?.p?.(`FILE: read`);
                    const fileMaybe: FileSystemFileHandle | undefined = await open();
                    if (fileMaybe === undefined) return u?.w?.(`ERROR: failed to read file`);
                    callbacks.set(fileMaybe.name, callback);
                    const file: FileSystemFileHandle = fileMaybe;
                    u?.p?.(`WORKER: postMessage`);
                    worker.postMessage(file);
                }
                Object.defineProperty(reader, `svg`, {
                    value: read,
                    enumerable: true,
                    writable: false,
                    configurable: false
                });
                Object.freeze(reader);

                u?.p?.(`LOADING EVENT: added reader`);
            }

            addSVGButton: {
                const svg: ((callback: (name: string, data: string) => any) => Promise<void>) | undefined = reader.svg;
                if (svg === undefined) {
                    u?.w?.(`ERROR: failed to add add-svg button: no reader.svg`);
                    break addSVGButton;
                }
                const button: Element | null = document.querySelector(`#add-svg`);
                if (button === null) {
                    u?.w?.(`ERROR: failed to add add-svg button: no #add-svg`);
                    break addSVGButton;
                }
                const onclick: () => void = () => {
                    u?.p?.(`EVENT: add-svg button onclick`);
                    svg((name: string, data: string): void => console.log(`name: ${name}\ndata: ${data}`));
                };
                button.addEventListener(`click`, onclick);

                u?.p?.(`LOADING EVENT: added add-svg button`);
            }

            u?.p?.(`LOADING EVENT: added reader worker`);
        }

        u?.p?.(`LOADING EVENT: added main`);
    });
}

