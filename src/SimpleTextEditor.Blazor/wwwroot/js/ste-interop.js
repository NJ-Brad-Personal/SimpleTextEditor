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

let _shortcutsContainer = null;

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
 * Inicjalizuje skróty klawiaturowe na kontenerze contenteditable
 */
export function initKeyboardShortcuts(container) {
    _shortcutsContainer = container;
    container.addEventListener('keydown', _onWysiwygKeyDown);
}

/**
 * Zwalnia listenery skrótów klawiaturowych
 */
export function disposeKeyboardShortcuts() {
    if (_shortcutsContainer) {
        _shortcutsContainer.removeEventListener('keydown', _onWysiwygKeyDown);
        _shortcutsContainer = null;
    }
}

// ============================================================
// SEKCJA 2c: Drag & drop i wklejanie obrazków
// ============================================================

let _dndState = {
    container: null,
    dotNetRef: null
};

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

async function _handleImageFiles(files) {
    if (!_dndState.dotNetRef) return;

    for (const file of files) {
        if (!file.type.startsWith('image/')) continue;
        try {
            const base64 = await _readFileAsBase64(file);
            await _dndState.dotNetRef.invokeMethodAsync(
                'OnImageDropped', file.name, base64, file.type
            );
        } catch (err) {
            // Ignoruj błędy odczytu pliku
        }
    }
}

function _onDrop(e) {
    if (!_dndState.container) return;
    const files = e.dataTransfer?.files;
    if (!files || files.length === 0) return;

    const hasImages = Array.from(files).some(f => f.type.startsWith('image/'));
    if (!hasImages) return;

    e.preventDefault();
    e.stopPropagation();
    _handleImageFiles(files);
}

function _onDragOver(e) {
    // Wymagane, żeby drop działał
    if (e.dataTransfer?.types?.includes('Files')) {
        e.preventDefault();
    }
}

function _onPaste(e) {
    if (!_dndState.container) return;
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
        _handleImageFiles(imageFiles);
    }
}

/**
 * Inicjalizuje obsługę drag & drop i wklejania obrazków
 */
export function initImageDragDrop(container, dotNetRef) {
    _dndState.container = container;
    _dndState.dotNetRef = dotNetRef;
    container.addEventListener('drop', _onDrop);
    container.addEventListener('dragover', _onDragOver);
    container.addEventListener('paste', _onPaste);
}

/**
 * Zwalnia listenery drag & drop / paste
 */
export function disposeImageDragDrop() {
    if (_dndState.container) {
        _dndState.container.removeEventListener('drop', _onDrop);
        _dndState.container.removeEventListener('dragover', _onDragOver);
        _dndState.container.removeEventListener('paste', _onPaste);
        _dndState.container = null;
        _dndState.dotNetRef = null;
    }
}

// ============================================================
// SEKCJA 3: Resize obrazków (tylko drag — popup w Blazor)
// ============================================================

let _resizeState = {
    activeImg: null,
    overlay: null,
    container: null,
    dotNetRef: null,
    handles: [],
    isDragging: false,
    dragHandle: null,
    startX: 0, startY: 0,
    startWidth: 0, startHeight: 0,
    aspectRatio: 1
};

/**
 * Inicjalizuje obsługę resize obrazków
 */
export function initImageResize(container, dotNetRef) {
    _resizeState.container = container;
    _resizeState.dotNetRef = dotNetRef;

    container.addEventListener('click', _onImageClick);
    container.addEventListener('dblclick', _onImageDblClick);
    document.addEventListener('click', _onOutsideClick);
    document.addEventListener('keydown', _onKeyDown);
}

/**
 * Zwalnia zasoby modułu resize
 */
export function disposeImageResize() {
    if (_resizeState.container) {
        _resizeState.container.removeEventListener('click', _onImageClick);
        _resizeState.container.removeEventListener('dblclick', _onImageDblClick);
    }
    document.removeEventListener('click', _onOutsideClick);
    document.removeEventListener('keydown', _onKeyDown);
    document.removeEventListener('mousemove', _onDragMove);
    document.removeEventListener('mouseup', _onDragEnd);
    _removeOverlay();
    _resizeState.container = null;
    _resizeState.dotNetRef = null;
    _resizeState.activeImg = null;
}

/**
 * Pobiera wymiary aktualnie zaznaczonego obrazka
 * @returns {{ width: number, height: number, src: string } | null}
 */
export function getSelectedImageInfo() {
    const img = _resizeState.activeImg;
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
    const img = _resizeState.activeImg;
    if (!img) return;
    img.style.width = width + 'px';
    img.style.height = height + 'px';
    img.setAttribute('width', width);
    img.setAttribute('height', height);
    _positionOverlay();
    _updateSizeLabel();
    _notifyChange();
}

/**
 * Odznacza aktualnie zaznaczony obrazek
 */
export function deselectImage() {
    _deselectImage();
}

// --- Wewnętrzne handlery ---

function _onImageClick(e) {
    if (e.target.tagName === 'IMG') {
        e.preventDefault();
        e.stopPropagation();
        _selectImage(e.target);
    }
}

function _onImageDblClick(e) {
    if (e.target.tagName === 'IMG') {
        e.preventDefault();
        e.stopPropagation();
        _selectImage(e.target);
        // Powiadom Blazor żeby otworzył popup
        if (_resizeState.dotNetRef) {
            const img = _resizeState.activeImg;
            const w = img.getAttribute('width') ? parseInt(img.getAttribute('width')) : img.offsetWidth;
            const h = img.getAttribute('height') ? parseInt(img.getAttribute('height')) : img.offsetHeight;
            _resizeState.dotNetRef.invokeMethodAsync('OnImageDblClick', w, h);
        }
    }
}

function _onOutsideClick(e) {
    if (!_resizeState.activeImg) return;
    if (e.target.tagName === 'IMG' && _resizeState.container && _resizeState.container.contains(e.target)) return;
    if (_resizeState.overlay && _resizeState.overlay.contains(e.target)) return;
    // Nie odznaczaj jeśli kliknięto w popup Blazor
    if (e.target.closest('.ste-img-resize-popup')) return;
    _deselectImage();
}

function _onKeyDown(e) {
    if (!_resizeState.activeImg) return;
    if (e.key === 'Escape') {
        _deselectImage();
        if (_resizeState.dotNetRef) {
            _resizeState.dotNetRef.invokeMethodAsync('OnImageDeselected');
        }
    }
    if (e.key === 'Delete' || e.key === 'Backspace') {
        if (e.target.closest('.ste-img-resize-popup')) return;
        _resizeState.activeImg.remove();
        _deselectImage();
        _notifyChange();
    }
}

function _selectImage(img) {
    if (_resizeState.activeImg === img) return;
    _deselectImage();
    _resizeState.activeImg = img;
    img.classList.add('ste-img-selected');
    _createOverlay();
}

function _deselectImage() {
    if (_resizeState.activeImg) {
        _resizeState.activeImg.classList.remove('ste-img-selected');
    }
    _resizeState.activeImg = null;
    _removeOverlay();
}

function _createOverlay() {
    _removeOverlay();
    const img = _resizeState.activeImg;
    if (!img) return;

    const overlay = document.createElement('div');
    overlay.className = 'ste-img-overlay';
    // Ważne: NIE dodajemy do contenteditable (container), tylko do wrapper (parent)
    overlay.setAttribute('contenteditable', 'false');
    _resizeState.overlay = overlay;

    ['nw', 'ne', 'sw', 'se'].forEach(pos => {
        const handle = document.createElement('div');
        handle.className = `ste-img-handle ste-img-handle-${pos}`;
        handle.dataset.pos = pos;
        handle.addEventListener('mousedown', _onDragStart);
        overlay.appendChild(handle);
        _resizeState.handles.push(handle);
    });

    const sizeLabel = document.createElement('div');
    sizeLabel.className = 'ste-img-size-label';
    sizeLabel.textContent = `${img.offsetWidth} × ${img.offsetHeight}`;
    sizeLabel.addEventListener('click', (e) => {
        e.stopPropagation();
        if (_resizeState.dotNetRef) {
            const w = img.getAttribute('width') ? parseInt(img.getAttribute('width')) : img.offsetWidth;
            const h = img.getAttribute('height') ? parseInt(img.getAttribute('height')) : img.offsetHeight;
            _resizeState.dotNetRef.invokeMethodAsync('OnImageDblClick', w, h);
        }
    });
    overlay.appendChild(sizeLabel);

    // Append do wrappera (parent), nie do contenteditable div
    const wrapper = _resizeState.container.parentElement;
    if (wrapper) {
        wrapper.appendChild(overlay);
    } else {
        _resizeState.container.appendChild(overlay);
    }
    _positionOverlay();
}

function _positionOverlay() {
    const { overlay, activeImg: img, container } = _resizeState;
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

function _removeOverlay() {
    if (_resizeState.overlay) {
        _resizeState.overlay.remove();
        _resizeState.overlay = null;
    }
    _resizeState.handles = [];
}

function _updateSizeLabel() {
    const { overlay, activeImg: img } = _resizeState;
    if (!overlay || !img) return;
    const label = overlay.querySelector('.ste-img-size-label');
    if (label) {
        label.textContent = `${Math.round(img.offsetWidth)} × ${Math.round(img.offsetHeight)}`;
    }
}

function _onDragStart(e) {
    e.preventDefault();
    e.stopPropagation();
    const img = _resizeState.activeImg;
    if (!img) return;

    _resizeState.isDragging = true;
    _resizeState.dragHandle = e.target.dataset.pos;
    _resizeState.startX = e.clientX;
    _resizeState.startY = e.clientY;
    _resizeState.startWidth = img.offsetWidth;
    _resizeState.startHeight = img.offsetHeight;
    _resizeState.aspectRatio = img.offsetWidth / img.offsetHeight;

    document.addEventListener('mousemove', _onDragMove);
    document.addEventListener('mouseup', _onDragEnd);
    document.body.style.cursor = _getCursor(_resizeState.dragHandle);
    document.body.style.userSelect = 'none';
}

function _onDragMove(e) {
    if (!_resizeState.isDragging || !_resizeState.activeImg) return;
    e.preventDefault();

    const { startX, startY, startWidth, startHeight, aspectRatio, dragHandle, activeImg: img } = _resizeState;
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
    _positionOverlay();
    _updateSizeLabel();
}

function _onDragEnd() {
    if (!_resizeState.isDragging) return;
    _resizeState.isDragging = false;
    _resizeState.dragHandle = null;
    document.removeEventListener('mousemove', _onDragMove);
    document.removeEventListener('mouseup', _onDragEnd);
    document.body.style.cursor = '';
    document.body.style.userSelect = '';
    _notifyChange();
}

function _getCursor(pos) {
    return (pos === 'nw' || pos === 'se') ? 'nwse-resize' : 'nesw-resize';
}

function _notifyChange() {
    if (_resizeState.dotNetRef) {
        _resizeState.dotNetRef.invokeMethodAsync('OnImageResized');
    }
}
