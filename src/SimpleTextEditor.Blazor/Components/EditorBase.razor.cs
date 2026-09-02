namespace SimpleTextEditor.Blazor.Components;

using Microsoft.AspNetCore.Components;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.JSInterop;
using SimpleTextEditor.Blazor.Services;
using SimpleTextEditor.Core.Abstractions;
using SimpleTextEditor.Core.Models;
using SimpleTextEditor.Core.Providers;
using SimpleTextEditor.Core.Services;
using SimpleTextEditor.Core.Themes;

/// <summary>
/// Bazowy komponent edytora Markdown z paskiem narzędzi, polem edycji i panelem podglądu.
/// Zapewnia czyste edytowanie Markdown bez trybu WYSIWYG.
/// </summary>
public partial class EditorBase : ComponentBase, IAsyncDisposable
{
    /// <summary>
    /// Środowisko uruchomieniowe JavaScript do operacji interop.
    /// </summary>
    [Inject]
    private IJSRuntime JSRuntime { get; set; } = default!;

    /// <summary>
    /// Dostawca usług — używany do pobrania domyślnych implementacji zarejestrowanych
    /// przez AddSimpleTextEditor, gdy nie podano ich przez parametry.
    /// </summary>
    [Inject]
    private IServiceProvider Services { get; set; } = default!;

    private ElementReference _containerRef;
    private ElementReference _textareaRef;
    private SteJsInterop? _jsInterop;
    private string _internalValue = "";
    private bool _isFullscreen = false;
    private bool _showPreview = true;
    
    /// <summary>
    /// Wartość treści Markdown.
    /// </summary>
    [Parameter]
    public string Value { get; set; } = "";
    
    /// <summary>
    /// Callback wywoływany przy zmianie wartości.
    /// </summary>
    [Parameter]
    public EventCallback<string> ValueChanged { get; set; }
    
    /// <summary>
    /// Konfiguracja trybu podglądu.
    /// </summary>
    [Parameter]
    public PreviewMode PreviewMode { get; set; } = PreviewMode.SideBySide;
    
    /// <summary>
    /// Nazwa motywu ("light" lub "dark").
    /// </summary>
    [Parameter]
    public string Theme { get; set; } = "light";
    
    /// <summary>
    /// Tekst zastępczy wyświetlany gdy edytor jest pusty.
    /// </summary>
    [Parameter]
    public string? Placeholder { get; set; }
    
    /// <summary>
    /// Niestandardowa kolekcja elementów paska narzędzi.
    /// </summary>
    [Parameter]
    public IReadOnlyList<ToolbarItem>? ToolbarItems { get; set; }
    
    /// <summary>
    /// Niestandardowy dostawca ikon dla paska narzędzi.
    /// </summary>
    [Parameter]
    public IIconProvider? IconProvider { get; set; }
    
    /// <summary>
    /// Niestandardowy dostawca lokalizacji dla tekstów interfejsu.
    /// </summary>
    [Parameter]
    public ILocalizationProvider? LocalizationProvider { get; set; }
    
    /// <summary>
    /// Niestandardowy parser Markdown do konwersji treści.
    /// </summary>
    [Parameter]
    public IMarkdownParser? MarkdownParser { get; set; }
    
    /// <summary>
    /// Niestandardowa instancja motywu do stylizacji.
    /// </summary>
    [Parameter]
    public IEditorTheme? EditorTheme { get; set; }
    
    /// <summary>
    /// Minimalna wysokość edytora w pikselach.
    /// </summary>
    [Parameter]
    public int MinHeight { get; set; } = 300;
    
    /// <summary>
    /// Maksymalna wysokość edytora w pikselach (0 = brak limitu).
    /// </summary>
    [Parameter]
    public int MaxHeight { get; set; } = 0;
    
    /// <summary>
    /// Tryb tylko do odczytu uniemożliwia edycję.
    /// </summary>
    [Parameter]
    public bool ReadOnly { get; set; } = false;
    
    /// <summary>
    /// Dodatkowa klasa CSS dla kontenera.
    /// </summary>
    [Parameter]
    public string? CssClass { get; set; }
    
    /// <summary>
    /// Callback wywoływany przy zmianie treści.
    /// </summary>
    [Parameter]
    public EventCallback<string> OnChange { get; set; }
    
    // Rozwiązane instancje — wyliczane raz (i ponownie tylko gdy zmieni się parametr źródłowy).
    // Wcześniej każdy odczyt tworzył nową instancję; ponieważ są przekazywane jako parametry
    // do paska narzędzi, nowa referencja przy każdym renderze wymuszała jego pełny re-render.
    private IIconProvider _iconProviderInstance = default!;
    private ILocalizationProvider _localizationProviderInstance = default!;
    private IMarkdownParser _markdownParserInstance = default!;
    private IEditorTheme _themeInstance = default!;
    private IReadOnlyList<ToolbarItem> _toolbarItemsList = default!;

    // Ostatnio widziane wartości parametrów źródłowych — do wykrycia zmiany.
    private IIconProvider? _lastIconProvider;
    private ILocalizationProvider? _lastLocalizationProvider;
    private IMarkdownParser? _lastMarkdownParser;
    private IEditorTheme? _lastEditorTheme;
    private string? _lastTheme;
    private IReadOnlyList<ToolbarItem>? _lastToolbarItems;

    private IIconProvider IconProviderInstance => _iconProviderInstance;
    private ILocalizationProvider LocalizationProviderInstance => _localizationProviderInstance;
    private IMarkdownParser MarkdownParserInstance => _markdownParserInstance;
    private IEditorTheme ThemeInstance => _themeInstance;
    private IReadOnlyList<ToolbarItem> ToolbarItemsList => _toolbarItemsList;

    private void ResolveInstances()
    {
        if (_iconProviderInstance is null || !ReferenceEquals(IconProvider, _lastIconProvider))
        {
            _lastIconProvider = IconProvider;
            _iconProviderInstance = IconProvider
                ?? Services.GetService<IIconProvider>()
                ?? new MaterialIconProvider();
        }

        if (_localizationProviderInstance is null || !ReferenceEquals(LocalizationProvider, _lastLocalizationProvider))
        {
            _lastLocalizationProvider = LocalizationProvider;
            _localizationProviderInstance = LocalizationProvider
                ?? Services.GetService<ILocalizationProvider>()
                ?? new DefaultLocalizationProvider();
        }

        if (_markdownParserInstance is null || !ReferenceEquals(MarkdownParser, _lastMarkdownParser))
        {
            _lastMarkdownParser = MarkdownParser;
            _markdownParserInstance = MarkdownParser
                ?? Services.GetService<IMarkdownParser>()
                ?? new MarkdownService();
            _previewHtmlSource = null;
        }

        if (_themeInstance is null || !ReferenceEquals(EditorTheme, _lastEditorTheme) || Theme != _lastTheme)
        {
            _lastEditorTheme = EditorTheme;
            _lastTheme = Theme;
            _themeInstance = EditorTheme ?? (Theme == "dark" ? new DarkTheme() : new LightTheme());
        }

        if (_toolbarItemsList is null || !ReferenceEquals(ToolbarItems, _lastToolbarItems))
        {
            _lastToolbarItems = ToolbarItems;
            _toolbarItemsList = ToolbarItems ?? Core.Models.ToolbarItems.Default;
        }
    }
    
    private PreviewMode CurrentPreviewMode => PreviewMode;
    
    private bool ShowPreview
    {
        get => _showPreview;
        set => _showPreview = value;
    }
    
    private string InternalValue
    {
        get => _internalValue;
        set
        {
            if (_internalValue != value)
            {
                _internalValue = value;
                _ = NotifyValueChanged();
            }
        }
    }
    
    // Podgląd jest wyliczany tylko gdy zmieni się treść. Wcześniej pełne parsowanie
    // Markdown + sanitizacja HTML odbywały się przy każdym renderze komponentu.
    private string? _previewHtmlSource;
    private string _previewHtmlCache = string.Empty;

    private string PreviewHtml
    {
        get
        {
            if (_previewHtmlSource != _internalValue)
            {
                _previewHtmlCache = MarkdownParserInstance.ToHtml(_internalValue);
                _previewHtmlSource = _internalValue;
            }
            return _previewHtmlCache;
        }
    }
    private string EffectivePlaceholder => Placeholder ?? LocalizationProviderInstance.Get("placeholder");
    private string ContainerClass => $"{ThemeInstance.ContainerClass} {CssClass} {(_isFullscreen ? "ste-fullscreen" : "")}".Trim();
    private string LayoutClass => CurrentPreviewMode switch
    {
        PreviewMode.SideBySide => "ste-side-by-side",
        PreviewMode.Toggle => "ste-toggle",
        _ => ""
    };
    
    /// <inheritdoc />
    protected override void OnInitialized()
    {
        _internalValue = Value;
        _jsInterop = new SteJsInterop(JSRuntime);
        ResolveInstances();
    }
    
    /// <inheritdoc />
    protected override void OnParametersSet()
    {
        if (Value != _internalValue)
        {
            _internalValue = Value;
        }

        ResolveInstances();
    }

    /// <inheritdoc />
    protected override async Task OnAfterRenderAsync(bool firstRender)
    {
        if (firstRender && _jsInterop != null)
        {
            // Skróty Ctrl+B / Ctrl+I obsługujemy w JS. Wcześniej textarea miała
            // @onkeydown, przez co każde naciśnięcie klawisza — także strzałki, Home,
            // End czy PageUp/Down — wysyłało zdarzenie na serwer i wymuszało
            // ponowny render całego edytora tylko po to, by je zignorować.
            await _jsInterop.InitMarkdownShortcutsAsync(_textareaRef);
        }
    }
    
    private async Task NotifyValueChanged()
    {
        await ValueChanged.InvokeAsync(_internalValue);
        await OnChange.InvokeAsync(_internalValue);
    }
    
    private async Task HandleToolbarClick(ToolbarItem item)
    {
        if (ReadOnly) return;
        
        switch (item.Id)
        {
            case "undo":
                // Obsługiwane przez przeglądarkę
                break;
            case "redo":
                // Obsługiwane przez przeglądarkę
                break;
            case "preview":
                ShowPreview = !ShowPreview;
                break;
            case "fullscreen":
                ToggleFullscreen();
                break;
            default:
                await InsertMarkdown(item);
                break;
        }
        
        StateHasChanged();
    }
    
    private async Task InsertMarkdown(ToolbarItem item)
    {
        if (_jsInterop == null) return;
        
        var newValue = await _jsInterop.InsertTextAsync(
            _textareaRef,
            item.MarkdownBefore,
            item.MarkdownAfter,
            item.NewLineBefore);
        
        _internalValue = newValue;
        await NotifyValueChanged();
    }
    
    private void ToggleFullscreen()
    {
        _isFullscreen = !_isFullscreen;
    }
    
    private bool IsToolbarItemActive(string itemId)
    {
        return itemId switch
        {
            "preview" => ShowPreview,
            "fullscreen" => _isFullscreen,
            _ => false
        };
    }
    
    /// <inheritdoc />
    public async ValueTask DisposeAsync()
    {
        if (_jsInterop != null)
        {
            try
            {
                await _jsInterop.DisposeMarkdownShortcutsAsync(_textareaRef);
            }
            catch (JSDisconnectedException)
            {
                // Obwód już rozłączony
            }

            await _jsInterop.DisposeAsync();
        }
    }
}
