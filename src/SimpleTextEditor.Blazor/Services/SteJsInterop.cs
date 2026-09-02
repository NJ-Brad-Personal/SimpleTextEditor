using Microsoft.AspNetCore.Components;
using Microsoft.JSInterop;

namespace SimpleTextEditor.Blazor.Services;

/// <summary>
/// Zunifikowany wrapper C# dla wszystkich operacji JavaScript interop.
/// Zastępuje EditorJsInterop + WysiwygJsInterop + osobny moduł resize.
/// </summary>
public class SteJsInterop : IAsyncDisposable
{
    private readonly IJSRuntime _jsRuntime;
    private IJSObjectReference? _module;
    private bool _isDisposed;

    // Kontener WYSIWYG ostatnio przekazany do Init*Async — zapamiętujemy go,
    // żeby parameterless DisposeAsync() (wymagany przez IAsyncDisposable) wiedział,
    // który kontener posprzątać, bez konieczności przekazywania go z zewnątrz.
    private ElementReference? _wysiwygContainer;

    public SteJsInterop(IJSRuntime jsRuntime)
    {
        _jsRuntime = jsRuntime;
    }

    private async ValueTask<IJSObjectReference> GetModuleAsync()
    {
        if (_module is null)
        {
            _module = await _jsRuntime.InvokeAsync<IJSObjectReference>(
                "import", "./_content/SimpleTextEditor.Blazor/js/ste-interop.js");
        }
        return _module;
    }

    // ============================================================
    // Sekcja 1: Operacje na textarea (tryb Markdown)
    // ============================================================

    /// <summary>
    /// Wstawia tekst w bieżącej pozycji kursora textarea.
    /// </summary>
    public async ValueTask<string> InsertTextAsync(ElementReference textarea, string before, string after, bool newLineBefore)
    {
        var module = await GetModuleAsync();
        return await module.InvokeAsync<string>("insertText", textarea, before, after, newLineBefore);
    }

    /// <summary>
    /// Pobiera numer bieżącej linii w textarea.
    /// </summary>
    public async ValueTask<int> GetCurrentLineAsync(ElementReference textarea)
    {
        var module = await GetModuleAsync();
        return await module.InvokeAsync<int>("getCurrentLine", textarea);
    }

    /// <summary>
    /// Podłącza skróty Ctrl+B / Ctrl+I do textarea (obsługa po stronie przeglądarki).
    /// </summary>
    public async ValueTask InitMarkdownShortcutsAsync(ElementReference textarea)
    {
        var module = await GetModuleAsync();
        await module.InvokeVoidAsync("initMarkdownShortcuts", textarea);
    }

    /// <summary>
    /// Odłącza skróty Markdown od textarea.
    /// </summary>
    public async ValueTask DisposeMarkdownShortcutsAsync(ElementReference textarea)
    {
        if (_module is not null)
        {
            try
            {
                await _module.InvokeVoidAsync("disposeMarkdownShortcuts", textarea);
            }
            catch (JSDisconnectedException)
            {
                // Obwód już rozłączony
            }
        }
    }

    /// <summary>
    /// Synchronizuje scroll edytora z podglądem.
    /// </summary>
    public async ValueTask SyncScrollAsync(ElementReference editor, ElementReference preview)
    {
        var module = await GetModuleAsync();
        await module.InvokeVoidAsync("syncScroll", editor, preview);
    }

    // ============================================================
    // Sekcja 2: Operacje WYSIWYG (contenteditable)
    // ============================================================

    /// <summary>
    /// Wykonuje polecenie formatowania na contenteditable.
    /// </summary>
    public async ValueTask ExecCommandAsync(string command, string? value = null)
    {
        var module = await GetModuleAsync();
        await module.InvokeVoidAsync("execCommand", command, value);
    }

    /// <summary>
    /// Pobiera HTML z elementu contenteditable.
    /// </summary>
    public async ValueTask<string> GetHtmlAsync(ElementReference element)
    {
        var module = await GetModuleAsync();
        return await module.InvokeAsync<string>("getHtml", element);
    }

    /// <summary>
    /// Ustawia HTML elementu contenteditable.
    /// </summary>
    public async ValueTask SetHtmlAsync(ElementReference element, string html)
    {
        var module = await GetModuleAsync();
        await module.InvokeVoidAsync("setHtml", element, html);
    }

    /// <summary>
    /// Wstawia HTML w bieżącej pozycji kursora.
    /// </summary>
    public async ValueTask InsertHtmlAsync(string html)
    {
        var module = await GetModuleAsync();
        await module.InvokeVoidAsync("insertHtml", html);
    }

    /// <summary>
    /// Stosuje wyrównanie tekstu.
    /// </summary>
    public async ValueTask AlignTextAsync(string alignment)
    {
        var module = await GetModuleAsync();
        await module.InvokeVoidAsync("alignText", alignment);
    }

    /// <summary>
    /// Sprawdza czy polecenie jest aktywne.
    /// </summary>
    public async ValueTask<bool> QueryCommandStateAsync(string command)
    {
        var module = await GetModuleAsync();
        return await module.InvokeAsync<bool>("queryCommandState", command);
    }

    /// <summary>
    /// Tworzy link z bieżącego zaznaczenia.
    /// </summary>
    public async ValueTask CreateLinkAsync(string url)
    {
        var module = await GetModuleAsync();
        await module.InvokeVoidAsync("createLink", url);
    }

    /// <summary>
    /// Wstawia obraz.
    /// </summary>
    public async ValueTask InsertImageAsync(string src)
    {
        var module = await GetModuleAsync();
        await module.InvokeVoidAsync("insertImage", src);
    }

    /// <summary>
    /// Formatuje bieżący blok jako nagłówek.
    /// </summary>
    public async ValueTask FormatBlockAsync(string level)
    {
        var module = await GetModuleAsync();
        await module.InvokeVoidAsync("formatBlock", level);
    }

    public async ValueTask InsertHorizontalRuleAsync()
    {
        var module = await GetModuleAsync();
        await module.InvokeVoidAsync("insertHorizontalRule");
    }

    public async ValueTask InsertOrderedListAsync()
    {
        var module = await GetModuleAsync();
        await module.InvokeVoidAsync("insertOrderedList");
    }

    public async ValueTask InsertUnorderedListAsync()
    {
        var module = await GetModuleAsync();
        await module.InvokeVoidAsync("insertUnorderedList");
    }

    public async ValueTask IndentAsync()
    {
        var module = await GetModuleAsync();
        await module.InvokeVoidAsync("indent");
    }

    public async ValueTask OutdentAsync()
    {
        var module = await GetModuleAsync();
        await module.InvokeVoidAsync("outdent");
    }

    /// <summary>
    /// Wykonuje undo na dokumencie (bez eval).
    /// </summary>
    public async ValueTask ExecUndoAsync()
    {
        var module = await GetModuleAsync();
        await module.InvokeVoidAsync("execUndo");
    }

    /// <summary>
    /// Wykonuje redo na dokumencie (bez eval).
    /// </summary>
    public async ValueTask ExecRedoAsync()
    {
        var module = await GetModuleAsync();
        await module.InvokeVoidAsync("execRedo");
    }

    /// <summary>
    /// Klika element o podanym ID (do triggerowania input file, bez eval).
    /// </summary>
    public async ValueTask ClickElementAsync(string elementId)
    {
        var module = await GetModuleAsync();
        await module.InvokeVoidAsync("clickElement", elementId);
    }

    // ============================================================
    // Sekcja 2b: Skróty klawiaturowe WYSIWYG
    // ============================================================

    /// <summary>
    /// Inicjalizuje skróty klawiaturowe (Ctrl+B/I/U/K/Z/Y) na kontenerze contenteditable.
    /// </summary>
    public async ValueTask InitKeyboardShortcutsAsync(ElementReference container)
    {
        _wysiwygContainer = container;
        var module = await GetModuleAsync();
        await module.InvokeVoidAsync("initKeyboardShortcuts", container);
    }

    /// <summary>
    /// Zwalnia listenery skrótów klawiaturowych z podanego kontenera.
    /// </summary>
    public async ValueTask DisposeKeyboardShortcutsAsync(ElementReference container)
    {
        if (_module is not null)
        {
            try
            {
                await _module.InvokeVoidAsync("disposeKeyboardShortcuts", container);
            }
            catch (JSDisconnectedException)
            {
                // Obwód już rozłączony
            }
        }
    }

    // ============================================================
    // Sekcja 2c: Drag & drop i wklejanie obrazków
    // ============================================================

    /// <summary>
    /// Inicjalizuje obsługę drag & drop i wklejania obrazków ze schowka.
    /// </summary>
    public async ValueTask InitImageDragDropAsync<T>(ElementReference container, DotNetObjectReference<T> dotNetRef) where T : class
    {
        _wysiwygContainer = container;
        var module = await GetModuleAsync();
        await module.InvokeVoidAsync("initImageDragDrop", container, dotNetRef);
    }

    /// <summary>
    /// Zwalnia listenery drag & drop i paste z podanego kontenera.
    /// </summary>
    public async ValueTask DisposeImageDragDropAsync(ElementReference container)
    {
        if (_module is not null)
        {
            try
            {
                await _module.InvokeVoidAsync("disposeImageDragDrop", container);
            }
            catch (JSDisconnectedException)
            {
                // Obwód już rozłączony
            }
        }
    }

    // ============================================================
    // Sekcja 3: Resize obrazków
    // ============================================================

    /// <summary>
    /// Inicjalizuje obsługę resize obrazków w kontenerze WYSIWYG.
    /// </summary>
    public async ValueTask InitImageResizeAsync<T>(ElementReference container, DotNetObjectReference<T> dotNetRef) where T : class
    {
        _wysiwygContainer = container;
        var module = await GetModuleAsync();
        await module.InvokeVoidAsync("initImageResize", container, dotNetRef);
    }

    /// <summary>
    /// Zwalnia zasoby modułu resize obrazków dla podanego kontenera.
    /// </summary>
    public async ValueTask DisposeImageResizeAsync(ElementReference container)
    {
        if (_module is not null)
        {
            try
            {
                await _module.InvokeVoidAsync("disposeImageResize", container);
            }
            catch (JSDisconnectedException)
            {
                // Obwód już rozłączony
            }
        }
    }

    /// <summary>
    /// Ustawia wymiary zaznaczonego obrazka (wywoływane z popupu Blazor).
    /// </summary>
    public async ValueTask SetSelectedImageSizeAsync(int width, int height)
    {
        var module = await GetModuleAsync();
        await module.InvokeVoidAsync("setSelectedImageSize", width, height);
    }

    /// <summary>
    /// Odznacza zaznaczony obrazek.
    /// </summary>
    public async ValueTask DeselectImageAsync()
    {
        var module = await GetModuleAsync();
        await module.InvokeVoidAsync("deselectImage");
    }

    // ============================================================
    // Dispose
    // ============================================================

    public async ValueTask DisposeAsync()
    {
        if (_isDisposed) return;
        _isDisposed = true;

        if (_wysiwygContainer is { } container)
        {
            await DisposeKeyboardShortcutsAsync(container);
            await DisposeImageDragDropAsync(container);
            await DisposeImageResizeAsync(container);
        }

        if (_module is not null)
        {
            try
            {
                await _module.DisposeAsync();
            }
            catch (JSDisconnectedException)
            {
                // Obwód już rozłączony
            }
        }
    }
}
