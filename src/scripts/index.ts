Main: {
    const ui = {};
    FormBinding: {
        const _uiForm = (document.forms as HTMLCollectionOf<HTMLFormElement> & { ui: HTMLFormElement }).ui;
        _uiForm.addEventListener(`change`, () =>
            window.location.hash = `#${btoa(JSON.stringify(Object.assign(ui,
                Object.fromEntries((new FormData(_uiForm)).entries())
            )))}`
        );
        Object.defineProperties(ui,
            Object.fromEntries(Array.from((new FormData(_uiForm)).keys())
                .map(key => [
                    key, {
                        get: () => (new FormData(_uiForm)).get(key),
                        set: (value: string) => {
                            window.location.hash = btoa(JSON.stringify(ui));
                            const radio = document.querySelector(`[type="radio"][name="${key}"][value="${value}"]`);
                            const check = document.querySelector(`[type="checkbox"][name="${key}"]`);
                            if (radio ?? check) return ((radio ?? check) as HTMLInputElement).click();
                            document.querySelector(`[name="${key}"]`)?.setAttribute(`value`, value);
                        }, enumerable: true
                    }
                ]))
        );
        try {
            Object.assign(ui, JSON.parse(atob(window.location.hash.slice(1))));
        } catch {
            window.location.hash = `#`;
        };
    }




    
}

