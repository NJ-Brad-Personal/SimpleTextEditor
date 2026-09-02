/**
 * SimpleTextEditor - Unified JavaScript Interop Module
 * Minimalny JS wymagany przez Blazor do operacji na DOM.
 * Obejmuje: kursor textarea, WYSIWYG execCommand, drag resize obrazków.
 */

// ============================================================
// SEKCJA 1: Operacje na textarea (tryb Markdown)
// ============================================================

/**
 * Pobiera zaznaczenie w textarea
 */
export function getSelection(textarea) {
    if (!textarea) return { start: 0, end: 0, selectedText: '' };
    return {
        start: textarea.selectionStart,
        end: textarea.selectionEnd,
        selectedText: textarea.value.substring(textarea.selectionStart, textarea.selectionEnd)
    };
}

/**
 * Ustawia pozycję kursora w textarea
 */
export function setSelection(textarea, start, end) {
    if (!textarea) return;
    end = end !== undefined ? end : start;
    textarea.focus();
    textarea.setSelectionRange(start, end);
}

/**
 * Wstawia tekst w bieżącej pozycji kursora w textarea
 */
export function insertText(textarea, before, after, newLineBefore) {
    if (!textarea) return '';

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const value = textarea.value;
    const selectedText = value.substring(start, end);

    let prefix = before || '';
    let suffix = after || '';

    if (newLineBefore && start > 0 && value[start - 1] !== '\n') {
        prefix = '\n' + prefix;
    }

    const newText = prefix + selectedText + suffix;
    const newValue = value.substring(0, start) + newText + value.substring(end);

    textarea.value = newValue;

    const newCursorPos = start + prefix.length + selectedText.length + suffix.length;
    textarea.setSelectionRange(newCursorPos, newCursorPos);
    textarea.focus();

    textarea.dispatchEvent(new Event('input', { bubbles: true }));
    return newValue;
}

/**
 * Pobiera numer bieżącej linii
 */
export function getCurrentLine(textarea) {
    if (!textarea) return 1;
    const value = textarea.value.substring(0, textarea.selectionStart);
    return (value.match(/\n/g) || []).length + 1;
}

/**
 * Skróty Ctrl+B / Ctrl+I dla trybu Markdown.
 * Obsługiwane w całości po stronie przeglądarki — dzięki temu nawigacja kursorem
 * (strzałki, Home, End, PageUp/Down) nie generuje żadnego ruchu do serwera.
 * insertText emituje zdarzenie 'input', więc wiązanie @bind w Blazor dostaje nową wartość.
 */
function _onMarkdownKeyDown(e) {
    if (!e.ctrlKey && !e.metaKey) return;

    let before, after;
    switch (e.key.toLowerCase()) {
        case 'b': before = '**'; after = '**'; break;
        case 'i': before = '*'; after = '*'; break;
        default: return;
    }

    e.preventDefault();
    insertText(e.currentTarget, before, after, false);
}

/**
 * Podłącza skróty Markdown do konkretnej textarea.
 * Stan trzymamy na elemencie, nie w module — dzięki temu wiele edytorów
 * na jednej stronie nie nadpisuje sobie nawzajem listenerów.
 */
export function initMarkdownShortcuts(textarea) {
    if (!textarea || textarea._steMarkdownShortcuts) return;
    textarea._steMarkdownShortcuts = _onMarkdownKeyDown;
    textarea.addEventListener('keydown', _onMarkdownKeyDown);
}

/**
 * Odłącza skróty Markdown od textarea
 */
export function disposeMarkdownShortcuts(textarea) {
    if (!textarea || !textarea._steMarkdownShortcuts) return;
    textarea.removeEventListener('keydown', textarea._steMarkdownShortcuts);
    textarea._steMarkdownShortcuts = null;
}

/**
 * Synchronizuje scroll edytora z podglądem
 */
export function syncScroll(editor, preview) {
    if (!editor || !preview) return;
    const percentage = editor.scrollTop / (editor.scrollHeight - editor.clientHeight);
    preview.scrollTop = percentage * (preview.scrollHeight - preview.clientHeight);
}

// ============================================================
// SEKCJA 2: Operacje WYSIWYG (contenteditable)
// ============================================================

/**
 * Wykonuje polecenie formatowania na contenteditable
 */
export function execCommand(command, value) {
    document.execCommand(command, false, value || null);
}

/**
 * Pobiera HTML z elementu contenteditable
 */
export function getHtml(element) {
    if (!element) return '';
    return element.innerHTML;
}

/**
 * Ustawia HTML elementu contenteditable
 */
export function setHtml(element, html) {
    if (!element) return;
    element.innerHTML = html || '';
}

/**
 * Wstawia HTML w bieżącej pozycji kursora
 */
export function insertHtml(html) {
    document.execCommand('insertHTML', false, html);
}

/**
 * Stosuje wyrównanie tekstu
 */
export function alignText(alignment) {
    const command = alignment === 'center' ? 'justifyCenter' :
        alignment === 'right' ? 'justifyRight' : 'justifyLeft';
    document.execCommand(command, false, null);
}

/**
 * Sprawdza stan polecenia
 */
export function queryCommandState(command) {
    return document.queryCommandState(command);
}

/**
 * Sprawdza czy URL ma bezpieczny protokół
 */
function _isSafeUrl(url) {
    if (!url) return false;
    const allowed = ['http:', 'https:', 'mailto:', 'tel:'];
    try {
        const parsed = new URL(url, window.location.href);
        return allowed.includes(parsed.protocol);
    } catch {
        return false;
    }
}

/**
 * Sprawdza czy URL jest bezpieczny dla obrazka (http/https/data:image)
 */
function _isSafeImageUrl(url) {
    if (!url) return false;
    if (url.startsWith('data:image/')) return true;
    return _isSafeUrl(url);
}

/**
 * Tworzy link z zaznaczenia (z walidacją protokołu)
 */
export function createLink(url) {
    if (!_isSafeUrl(url)) return;
    document.execCommand('createLink', false, url);
}

/**
 * Wstawia obraz (z walidacją protokołu)
 */
export function insertImage(src) {
    if (!_isSafeImageUrl(src)) return;
    document.execCommand('insertImage', false, src);
}

/**
 * Formatuje blok jako nagłówek
 */
export function formatBlock(level) {
    document.execCommand('formatBlock', false, level);
}

export function insertHorizontalRule() {
    document.execCommand('insertHorizontalRule', false, null);
}

export function insertOrderedList() {
    document.execCommand('insertOrderedList', false, null);
}

export function insertUnorderedList() {
    document.execCommand('insertUnorderedList', false, null);
}

export function indent() {
    document.execCommand('indent', false, null);
}

export function outdent() {
    document.execCommand('outdent', false, null);
}

/**
 * Wykonuje undo na dokumencie
 */
export function execUndo() {
    document.execCommand('undo', false, null);
}

/**
 * Wykonuje redo na dokumencie
 */
export function execRedo() {
    document.execCommand('redo', false, null);
}

/**
 * Klika element o podanym ID (do triggerowania input file)
 */
export function clickElement(elementId) {
    const el = document.getElementById(elementId);
    if (el) el.click();
}

// ============================================================
// SEKCJA 2b: Skróty klawiaturowe WYSIWYG (contenteditable)
// ============================================================

function _onWysiwygKeyDown(e) {
    if (!e.ctrlKey && !e.metaKey) return;

    const key = e.key.toLowerCase();
    let handled = true;

    switch (key) {
        case 'b':
            document.execCommand('bold', false, null);
            break;
        case 'i':
            document.execCommand('italic', false, null);
            break;
        case 'u':
            document.execCommand('underline', false, null);
            break;
        case 'k': {
            e.preventDefault();
            const url = prompt('Podaj URL linku:');
            if (url && _isSafeUrl(url)) {
                document.execCommand('createLink', false, url);
            }
            handled = true;
            break;
        }
        case 'z':
            document.execCommand('undo', false, null);
            break;
        case 'y':
            document.execCommand('redo', false, null);
            break;
        default:
            handled = false;
    }

    if (handled) {
        e.preventDefault();
    }
}

/**
 * Inicjalizuje skróty klawiaturowe na kontenerze contenteditable.
 * Stan trzymamy na elemencie (nie w module) — jedna strona może hostować
 * wiele edytorów WYSIWYG jednocześnie, każdy z własnym kontenerem.
 */
export function initKeyboardShortcuts(container) {
    if (!container || container._steWysiwygShortcuts) return;
    container._steWysiwygShortcuts = _onWysiwygKeyDown;
    container.addEventListener('keydown', _onWysiwygKeyDown);
}

/**
 * Zwalnia listenery skrótów klawiaturowych z podanego kontenera.
 */
export function disposeKeyboardShortcuts(container) {
    if (!container || !container._steWysiwygShortcuts) return;
    container.removeEventListener('keydown', container._steWysiwygShortcuts);
    container._steWysiwygShortcuts = null;
}

// ============================================================
// SEKCJA 2c: Drag & drop i wklejanie obrazków
// ============================================================

function _readFileAsBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
            // Usuń prefix "data:image/...;base64,"
            const base64 = reader.result.split(',')[1];
            resolve(base64);
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

async function _handleImageFiles(files, dotNetRef) {
    if (!dotNetRef) return;

    for (const file of files) {
        if (!file.type.startsWith('image/')) continue;
        try {
            const base64 = await _readFileAsBase64(file);
            await dotNetRef.invokeMethodAsync(
                'OnImageDropped', file.name, base64, file.type
            );
        } catch (err) {
            // Ignoruj błędy odczytu pliku
        }
    }
}

// Stan trzymany na elemencie (container._steDnd), nie w module — dzięki temu
// upuszczenie/wklejenie obrazka w jednym edytorze trafia do JEGO dotNetRef,
// a nie do ostatnio zainicjalizowanego edytora na stronie.
function _onDrop(e) {
    const state = e.currentTarget && e.currentTarget._steDnd;
    if (!state) return;
    const files = e.dataTransfer?.files;
    if (!files || files.length === 0) return;

    const hasImages = Array.from(files).some(f => f.type.startsWith('image/'));
    if (!hasImages) return;

    e.preventDefault();
    e.stopPropagation();
    _handleImageFiles(files, state.dotNetRef);
}

function _onDragOver(e) {
    // Wymagane, żeby drop działał
    if (e.dataTransfer?.types?.includes('Files')) {
        e.preventDefault();
    }
}

function _onPaste(e) {
    const state = e.currentTarget && e.currentTarget._steDnd;
    if (!state) return;
    const items = e.clipboardData?.items;
    if (!items) return;

    const imageFiles = [];
    for (const item of items) {
        if (item.type.startsWith('image/')) {
            const file = item.getAsFile();
            if (file) imageFiles.push(file);
        }
    }

    if (imageFiles.length > 0) {
        e.preventDefault();
        _handleImageFiles(imageFiles, state.dotNetRef);
    }
}

/**
 * Inicjalizuje obsługę drag & drop i wklejania obrazków dla podanego kontenera.
 */
export function initImageDragDrop(container, dotNetRef) {
    if (!container) return;
    disposeImageDragDrop(container);
    container._steDnd = { dotNetRef };
    container.addEventListener('drop', _onDrop);
    container.addEventListener('dragover', _onDragOver);
    container.addEventListener('paste', _onPaste);
}

/**
 * Zwalnia listenery drag & drop / paste z podanego kontenera.
 */
export function disposeImageDragDrop(container) {
    if (!container || !container._steDnd) return;
    container.removeEventListener('drop', _onDrop);
    container.removeEventListener('dragover', _onDragOver);
    container.removeEventListener('paste', _onPaste);
    container._steDnd = null;
}

// ============================================================
// SEKCJA 3: Resize obrazków (tylko drag — popup w Blazor)
// ============================================================

// Stan trzymany na elemencie (container._steResize), nie w jednym współdzielonym
// obiekcie modułu — poprzednio drugi zainicjalizowany edytor nadpisywał
// container/dotNetRef pierwszego, więc dwuklik na obrazku w edytorze A
// wywoływał popup w komponencie B, a upuszczony/przeciągnięty rozmiar trafiał
// do złego obwodu Blazor. Klikalny naraz może być tylko jeden obrazek na całej
// stronie — _activeResize wskazuje, który kontener go aktualnie "posiada".
let _activeResize = null;
let _resizeDocListenerCount = 0;

function _attachDocListeners() {
    if (_resizeDocListenerCount === 0) {
        document.addEventListener('click', _onOutsideClick);
        document.addEventListener('keydown', _onKeyDown);
    }
    _resizeDocListenerCount++;
}

function _detachDocListeners() {
    _resizeDocListenerCount = Math.max(0, _resizeDocListenerCount - 1);
    if (_resizeDocListenerCount === 0) {
        document.removeEventListener('click', _onOutsideClick);
        document.removeEventListener('keydown', _onKeyDown);
    }
}

/**
 * Inicjalizuje obsługę resize obrazków dla podanego kontenera.
 */
export function initImageResize(container, dotNetRef) {
    if (!container) return;
    disposeImageResize(container);

    const state = {
        container,
        dotNetRef,
        activeImg: null,
        overlay: null,
        handles: [],
        isDragging: false,
        dragHandle: null,
        startX: 0, startY: 0,
        startWidth: 0, startHeight: 0,
        aspectRatio: 1,
        onDragMove: null,
        onDragEnd: null
    };
    state.onImageClick = (e) => _onImageClick(e, state);
    state.onImageDblClick = (e) => _onImageDblClick(e, state);

    container._steResize = state;
    container.addEventListener('click', state.onImageClick);
    container.addEventListener('dblclick', state.onImageDblClick);
    _attachDocListeners();
}

/**
 * Zwalnia zasoby modułu resize dla podanego kontenera.
 */
export function disposeImageResize(container) {
    if (!container || !container._steResize) return;
    const state = container._steResize;

    container.removeEventListener('click', state.onImageClick);
    container.removeEventListener('dblclick', state.onImageDblClick);
    if (state.isDragging) {
        document.removeEventListener('mousemove', state.onDragMove);
        document.removeEventListener('mouseup', state.onDragEnd);
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
    }
    _removeOverlay(state);
    if (_activeResize === state) {
        _activeResize = null;
    }
    container._steResize = null;
    _detachDocListeners();
}

/**
 * Pobiera wymiary aktualnie zaznaczonego obrazka
 * @returns {{ width: number, height: number, src: string } | null}
 */
export function getSelectedImageInfo() {
    const img = _activeResize?.activeImg;
    if (!img) return null;
    return {
        width: img.getAttribute('width') ? parseInt(img.getAttribute('width')) : img.offsetWidth,
        height: img.getAttribute('height') ? parseInt(img.getAttribute('height')) : img.offsetHeight,
        src: img.src
    };
}

/**
 * Ustawia wymiary zaznaczonego obrazka (wywoływane z Blazor popupu)
 */
export function setSelectedImageSize(width, height) {
    const state = _activeResize;
    const img = state?.activeImg;
    if (!img) return;
    img.style.width = width + 'px';
    img.style.height = height + 'px';
    img.setAttribute('width', width);
    img.setAttribute('height', height);
    _positionOverlay(state);
    _updateSizeLabel(state);
    _notifyChange(state);
}

/**
 * Odznacza aktualnie zaznaczony obrazek
 */
export function deselectImage() {
    if (_activeResize) {
        _deselectImage(_activeResize);
    }
}

// --- Wewnętrzne handlery ---

function _onImageClick(e, state) {
    if (e.target.tagName === 'IMG') {
        e.preventDefault();
        e.stopPropagation();
        _selectImage(e.target, state);
    }
}

function _onImageDblClick(e, state) {
    if (e.target.tagName === 'IMG') {
        e.preventDefault();
        e.stopPropagation();
        _selectImage(e.target, state);
        // Powiadom Blazor żeby otworzył popup — dotNetRef pochodzi z TEGO kontenera
        if (state.dotNetRef) {
            const img = state.activeImg;
            const w = img.getAttribute('width') ? parseInt(img.getAttribute('width')) : img.offsetWidth;
            const h = img.getAttribute('height') ? parseInt(img.getAttribute('height')) : img.offsetHeight;
            state.dotNetRef.invokeMethodAsync('OnImageDblClick', w, h);
        }
    }
}

function _onOutsideClick(e) {
    const state = _activeResize;
    if (!state || !state.activeImg) return;
    if (e.target.tagName === 'IMG' && state.container && state.container.contains(e.target)) return;
    if (state.overlay && state.overlay.contains(e.target)) return;
    // Nie odznaczaj jeśli kliknięto w popup Blazor
    if (e.target.closest('.ste-img-resize-popup')) return;
    _deselectImage(state);
}

function _onKeyDown(e) {
    const state = _activeResize;
    if (!state || !state.activeImg) return;
    if (e.key === 'Escape') {
        _deselectImage(state);
        if (state.dotNetRef) {
            state.dotNetRef.invokeMethodAsync('OnImageDeselected');
        }
    }
    if (e.key === 'Delete' || e.key === 'Backspace') {
        if (e.target.closest('.ste-img-resize-popup')) return;
        state.activeImg.remove();
        _deselectImage(state);
        _notifyChange(state);
    }
}

function _selectImage(img, state) {
    if (_activeResize && _activeResize !== state) {
        // Tylko jeden obrazek na stronie może być zaznaczony naraz.
        _deselectImage(_activeResize);
    }
    if (state.activeImg === img) return;
    _deselectImage(state);
    state.activeImg = img;
    img.classList.add('ste-img-selected');
    _activeResize = state;
    _createOverlay(state);
}

function _deselectImage(state) {
    if (state.activeImg) {
        state.activeImg.classList.remove('ste-img-selected');
    }
    state.activeImg = null;
    _removeOverlay(state);
    if (_activeResize === state) {
        _activeResize = null;
    }
}

function _createOverlay(state) {
    _removeOverlay(state);
    const img = state.activeImg;
    if (!img) return;

    const overlay = document.createElement('div');
    overlay.className = 'ste-img-overlay';
    // Ważne: NIE dodajemy do contenteditable (container), tylko do wrapper (parent)
    overlay.setAttribute('contenteditable', 'false');
    state.overlay = overlay;
    state.handles = [];

    ['nw', 'ne', 'sw', 'se'].forEach(pos => {
        const handle = document.createElement('div');
        handle.className = `ste-img-handle ste-img-handle-${pos}`;
        handle.dataset.pos = pos;
        handle.addEventListener('mousedown', (e) => _onDragStart(e, state));
        overlay.appendChild(handle);
        state.handles.push(handle);
    });

    const sizeLabel = document.createElement('div');
    sizeLabel.className = 'ste-img-size-label';
    sizeLabel.textContent = `${img.offsetWidth} × ${img.offsetHeight}`;
    sizeLabel.addEventListener('click', (e) => {
        e.stopPropagation();
        if (state.dotNetRef) {
            const w = img.getAttribute('width') ? parseInt(img.getAttribute('width')) : img.offsetWidth;
            const h = img.getAttribute('height') ? parseInt(img.getAttribute('height')) : img.offsetHeight;
            state.dotNetRef.invokeMethodAsync('OnImageDblClick', w, h);
        }
    });
    overlay.appendChild(sizeLabel);

    // Append do wrappera (parent), nie do contenteditable div
    const wrapper = state.container.parentElement;
    if (wrapper) {
        wrapper.appendChild(overlay);
    } else {
        state.container.appendChild(overlay);
    }
    _positionOverlay(state);
}

function _positionOverlay(state) {
    const { overlay, activeImg: img, container } = state;
    if (!overlay || !img) return;

    // Używamy getBoundingClientRect relative do wrappera
    const wrapper = container.parentElement || container;
    const wrapperRect = wrapper.getBoundingClientRect();
    const imgRect = img.getBoundingClientRect();

    overlay.style.position = 'absolute';
    overlay.style.left = (imgRect.left - wrapperRect.left + wrapper.scrollLeft - 2) + 'px';
    overlay.style.top = (imgRect.top - wrapperRect.top + wrapper.scrollTop - 2) + 'px';
    overlay.style.width = (imgRect.width + 4) + 'px';
    overlay.style.height = (imgRect.height + 4) + 'px';
    overlay.style.zIndex = '100';
}

function _removeOverlay(state) {
    if (state.overlay) {
        state.overlay.remove();
        state.overlay = null;
    }
    state.handles = [];
}

function _updateSizeLabel(state) {
    const { overlay, activeImg: img } = state;
    if (!overlay || !img) return;
    const label = overlay.querySelector('.ste-img-size-label');
    if (label) {
        label.textContent = `${Math.round(img.offsetWidth)} × ${Math.round(img.offsetHeight)}`;
    }
}

function _onDragStart(e, state) {
    e.preventDefault();
    e.stopPropagation();
    const img = state.activeImg;
    if (!img) return;

    state.isDragging = true;
    state.dragHandle = e.target.dataset.pos;
    state.startX = e.clientX;
    state.startY = e.clientY;
    state.startWidth = img.offsetWidth;
    state.startHeight = img.offsetHeight;
    state.aspectRatio = img.offsetWidth / img.offsetHeight;

    state.onDragMove = (ev) => _onDragMove(ev, state);
    state.onDragEnd = () => _onDragEnd(state);

    document.addEventListener('mousemove', state.onDragMove);
    document.addEventListener('mouseup', state.onDragEnd);
    document.body.style.cursor = _getCursor(state.dragHandle);
    document.body.style.userSelect = 'none';
}

function _onDragMove(e, state) {
    if (!state.isDragging || !state.activeImg) return;
    e.preventDefault();

    const { startX, startY, startWidth, startHeight, aspectRatio, dragHandle, activeImg: img } = state;
    const dx = e.clientX - startX;
    const dy = e.clientY - startY;
    let w = startWidth, h = startHeight;

    switch (dragHandle) {
        case 'se': w = Math.max(50, startWidth + dx); h = e.shiftKey ? Math.max(50, startHeight + dy) : w / aspectRatio; break;
        case 'sw': w = Math.max(50, startWidth - dx); h = e.shiftKey ? Math.max(50, startHeight + dy) : w / aspectRatio; break;
        case 'ne': w = Math.max(50, startWidth + dx); h = e.shiftKey ? Math.max(50, startHeight - dy) : w / aspectRatio; break;
        case 'nw': w = Math.max(50, startWidth - dx); h = e.shiftKey ? Math.max(50, startHeight - dy) : w / aspectRatio; break;
    }

    img.style.width = Math.round(w) + 'px';
    img.style.height = Math.round(h) + 'px';
    img.setAttribute('width', Math.round(w));
    img.setAttribute('height', Math.round(h));
    _positionOverlay(state);
    _updateSizeLabel(state);
}

function _onDragEnd(state) {
    if (!state.isDragging) return;
    state.isDragging = false;
    state.dragHandle = null;
    document.removeEventListener('mousemove', state.onDragMove);
    document.removeEventListener('mouseup', state.onDragEnd);
    document.body.style.cursor = '';
    document.body.style.userSelect = '';
    _notifyChange(state);
}

function _getCursor(pos) {
    return (pos === 'nw' || pos === 'se') ? 'nwse-resize' : 'nesw-resize';
}

function _notifyChange(state) {
    if (state?.dotNetRef) {
        state.dotNetRef.invokeMethodAsync('OnImageResized');
    }
}
