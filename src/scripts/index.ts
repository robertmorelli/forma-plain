Main: {
    const ui = {};
    FormBinding: {
        const uiForm = (document.forms as HTMLCollectionOf<HTMLFormElement> & { ui: HTMLFormElement }).ui;

        listen: {
            function setHashToUI(): void {
                const formData = new FormData(uiForm);
                const entries = Array.from(formData.entries());
                const onbect = Object.fromEntries(entries);
                const json = JSON.stringify(onbect);
                const base64 = btoa(json);
                window.location.hash = `#${base64}`;
            }
            uiForm.addEventListener(`change`, setHashToUI);
        }

        object: {
            const keys = Array.from((new FormData(uiForm)).keys());
            for (const key of keys) {
                function get(): string | undefined {
                    const formData: FormData = new FormData(uiForm);
                    const value: FormDataEntryValue | null = formData.get(key);
                    if (value === null) return undefined;
                    return value.toString();
                }
                function set(value: string): void {
                    try {
                        window.location.hash = btoa(JSON.stringify(ui));
                    }
                    catch {
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
                Object.assign(ui, JSON.parse(atob(window.location.hash.slice(1))));
            } catch {
                window.location.hash = `#`;
            };
        }
    }
    const reader = {};
    readerWorker: {
        const callbacks: Map<string, Function> = new Map();
        let worker: Worker
        try {
            const elem: Element | null = document.querySelector("script[type='text\/js-worker']");
            if (elem === null) break readerWorker;
            const blob: Blob = new Blob(
                [elem.textContent as string],
                { type: "text/javascript" },
            );
            const url: string = window.URL.createObjectURL(blob);
            worker = new Worker(url);
        }
        catch {
            break readerWorker;
        }
        worker: {
            function onmessage({ data }: { data: Map<string, string> }): void {
                const entry: IteratorResult<[String, String] | undefined> = data.entries().next();
                if (entry.done) return;
                const value: [String, String] | undefined = entry.value;
                if (value === undefined) return;
                const [name, text]: [string, string] = value as [string, string];
                const callback: Function | undefined = callbacks.get(name);
                if (callback === undefined) return;
                callbacks.delete(name);
                callback(text);
            }
            Object.defineProperty(worker, 'onmessage', {
                value: onmessage,
                enumerable: true,
                writable: false,
                configurable: false
            });
            Object.freeze(worker);
        }

        reader: {
            async function open(): Promise<FileSystemFileHandle | undefined> {
                const files: FileSystemFileHandle[] = await window.showOpenFilePicker({
                    multiple: false,
                    types: [{ description: `SVG Files`, accept: { 'image/svg+xml': [`.svg`] } }]
                });
                return files.pop();
            }
            async function read(callback: Function): Promise<void> {
                const fileMaybe: FileSystemFileHandle | undefined = await open();
                if (fileMaybe === undefined) return;
                callbacks.set(fileMaybe.name, callback);
                const file: FileSystemFileHandle = fileMaybe;
                worker.postMessage(file);
            }
            Object.defineProperty(reader, `svg`, {
                value: read,
                enumerable: true,
                writable: false,
                configurable: false
            });
            Object.freeze(reader);
        }
    }


}

