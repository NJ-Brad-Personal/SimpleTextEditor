# SimpleTextEditor - Documentation (EN)

A Blazor component library for editing Markdown text with a WYSIWYG mode.

---

## Table of Contents

1. [Installation](#installation)
2. [Quick Start](#quick-start)
3. [Components](#components)
   - [RadzenMarkdownEditor](#radzenmarkdowneditor)
   - [EditorBase](#editorbase)
4. [Interfaces](#interfaces)
   - [IImageUploadHandler](#iimageuploadhandler)
   - [IMarkdownParser](#imarkdownparser)
   - [IIconProvider](#iiconprovider)
   - [ILocalizationProvider](#ilocalizationprovider)
   - [IEditorTheme](#ieditortheme)
5. [Models](#models)
   - [EditorMode](#editormode)
   - [PreviewMode](#previewmode)
   - [ToolbarItem](#toolbaritem)
   - [ToolbarItems (predefined)](#toolbaritems-predefined)
6. [JavaScript Architecture](#javascript-architecture)
7. [Image Resizing](#image-resizing)
8. [Status Bar](#status-bar)
9. [WYSIWYG Keyboard Shortcuts](#wysiwyg-keyboard-shortcuts)
10. [Drag & Drop and Image Pasting (WYSIWYG)](#drag--drop-and-image-pasting-wysiwyg)
11. [Security (Security Hardening)](#security-security-hardening)
12. [Usage Examples](#usage-examples)

---

## Installation

```bash
dotnet add package SimpleTextEditor.Radzen
```

Add to `_Imports.razor`:
```razor
@using SimpleTextEditor.Radzen.Components
@using SimpleTextEditor.Core.Models
@using SimpleTextEditor.Core.Abstractions
```

---

## Quick Start

```razor
@page "/editor"

<RadzenMarkdownEditor @bind-Value="content" />

@code {
    private string content = "# Hello, world!";
}
```

---

## Components

### RadzenMarkdownEditor

The main editor component with support for WYSIWYG and Markdown modes.

#### Detailed parameter description

| Parameter | Type | Default Value | Detailed Description |
|-----------|------|----------------|-----------------------|
| `Value` | `string` | `""` | **The editor's content in Markdown format.** This is the main property holding the text. Use with `@bind-Value` for two-way binding, or pass the value and `ValueChanged` separately. |
| `ValueChanged` | `EventCallback<string>` | - | **Callback invoked on every value change.** Used automatically with `@bind-Value`. Lets you react to changes in real time. |
| `Mode` | `EditorMode` | `Wysiwyg` | **Initial editing mode.** `Wysiwyg` - the visual (WYSIWYG) editor, `Markdown` - editing raw Markdown source. The user can switch modes with the toolbar button. |
| `PreviewMode` | `PreviewMode` | `SideBySide` | **Preview mode (Markdown mode only).** `None` - no preview, `SideBySide` - editor and preview side by side (50/50), `Toggle` - switch between editor and preview. |
| `Theme` | `string` | `"light"` | **Name of the color theme.** Available values: `"light"`, `"dark"`. You can also use the `EditorTheme` parameter for a custom theme. |
| `Placeholder` | `string?` | `null` | **Placeholder text shown when the editor is empty.** If `null`, uses the default from `LocalizationProvider` (key `"placeholder"`). |
| `MinHeight` | `int` | `300` | **Minimum editor height in pixels.** The editor will not shrink below this value even when there's no content. |
| `MaxHeight` | `int` | `0` | **Maximum editor height in pixels.** `0` means no limit - the editor grows with the content. With a value > 0, a scrollbar appears. |
| `ReadOnly` | `bool` | `false` | **Read-only mode.** When `true`, the user cannot edit the content. The toolbar is hidden. Useful for displaying articles. |
| `CssClass` | `string?` | `null` | **Additional CSS class for the editor container.** Allows custom styling, e.g. `"my-custom-editor border-primary"`. |
| `ToolbarItems` | `IReadOnlyList<ToolbarItem>?` | `null` | **Custom toolbar configuration.** When `null`, uses the default set (`ToolbarItems.Default`). Lets you remove unwanted buttons or add your own. |
| `ImageUploadHandler` | `IImageUploadHandler?` | `null` | **Image upload handler.** When `null`, uses `Base64ImageUploadHandler` - images are converted to Base64 and embedded in the content. Implement your own handler for Azure Blob, S3, etc. |
| `HtmlToMarkdownConverter` | `IHtmlToMarkdownConverter?` | `null` | **HTML → Markdown converter (WYSIWYG).** When `null`, uses the default `HtmlToMarkdownConverter`. Implement your own if you need custom conversion from WYSIWYG to Markdown. |
| `IconProvider` | `IIconProvider?` | `null` | **Icon provider for the toolbar.** When `null`, uses `MaterialIconProvider` (Material Icons). Implement your own for FontAwesome, Bootstrap Icons, etc. |
| `LocalizationProvider` | `ILocalizationProvider?` | `null` | **UI translation provider.** When `null`, uses `DefaultLocalizationProvider` (English). Implement your own for Polish or other languages. |
| `MarkdownParser` | `IMarkdownParser?` | `null` | **Markdown-to-HTML parser.** When `null`, uses `MarkdownService` based on the Markdig library. Implement your own if you need different syntax. |
| `EditorTheme` | `IEditorTheme?` | `null` | **Custom theme instance.** Takes priority over the `Theme` parameter. Gives full control over the editor's CSS styles. |
| `OnChange` | `EventCallback<string>` | - | **Callback on every content change.** Similar to `ValueChanged`, but invoked independently. Both can be used at the same time. |

#### Example with all options

```razor
@page "/full-editor"
@using SimpleTextEditor.Radzen.Components
@using SimpleTextEditor.Core.Models
@using SimpleTextEditor.Core.Abstractions

<h3>Full editor example</h3>

<RadzenMarkdownEditor 
    @bind-Value="content"
    Mode="EditorMode.Wysiwyg"
    PreviewMode="PreviewMode.SideBySide"
    Theme="dark"
    Placeholder="Start writing your article..."
    MinHeight="400"
    MaxHeight="800"
    ReadOnly="false"
    CssClass="my-custom-editor shadow-lg"
    ToolbarItems="customToolbar"
    ImageUploadHandler="imageHandler"
    IconProvider="iconProvider"
    LocalizationProvider="localizationProvider"
    EditorTheme="customTheme"
    OnChange="HandleContentChange" />

<div class="mt-3">
    <strong>Character count:</strong> @content.Length
</div>

@code {
    private string content = "# My article\n\nArticle content...";
    
    // Custom image handler - saves to Azure Blob Storage
    private IImageUploadHandler imageHandler = new AzureBlobImageHandler(
        connectionString: "DefaultEndpointsProtocol=https;AccountName=...",
        containerName: "images"
    );
    
    // Custom icon provider - FontAwesome instead of Material Icons
    private IIconProvider iconProvider = new FontAwesomeIconProvider();
    
    // Polish UI
    private ILocalizationProvider localizationProvider = new PolishLocalizationProvider();
    
    // Custom theme with custom styles
    private IEditorTheme customTheme = new CustomDarkTheme();
    
    // Custom toolbar - only basic formatting
    private IReadOnlyList<ToolbarItem> customToolbar = new[]
    {
        ToolbarItems.Bold,
        ToolbarItems.Italic,
        ToolbarItems.Strikethrough,
        ToolbarItem.Separator,
        ToolbarItems.Heading1,
        ToolbarItems.Heading2,
        ToolbarItem.Separator,
        ToolbarItems.BulletList,
        ToolbarItems.NumberedList,
        ToolbarItem.Separator,
        ToolbarItems.Link,
        ToolbarItems.Image,
        ToolbarItem.Separator,
        ToolbarItems.SwitchMode
    };
    
    private void HandleContentChange(string newContent)
    {
        Console.WriteLine($"Content changed: {newContent.Length} characters");
        // You can add auto-save, validation, etc. here
    }
}
```

---

### EditorBase

A plain Markdown editor without Radzen styles. Use it when:
- You want your own CSS styling
- You don't need Radzen components
- You're building an editor as a base for a different UI framework

#### EditorBase parameters

Same as `RadzenMarkdownEditor`, with the following differences:

| Parameter | Difference vs RadzenMarkdownEditor |
|-----------|--------------------------------------|
| `Mode` | **Not present** - EditorBase only supports Markdown mode |

---

## Interfaces

### IImageUploadHandler

Interface for handling image uploads. **By default, images are converted to Base64** and embedded directly in the Markdown content, which has downsides:
- Large document size
- Slow loading
- Duplication when copying

Implement your own handler to store images in:
- **Database** - the simplest approach, everything in one place
- **File system** - for simple applications and local deployments
- **AWS S3 / CDN** - for scalable cloud applications
- **Azure Blob Storage** - for applications in the Azure ecosystem

#### Interface signature

```csharp
public interface IImageUploadHandler
{
    /// <summary>
    /// Saves the image and returns the URL to use in the editor.
    /// </summary>
    /// <param name="fileName">Original file name, e.g. "photo.png"</param>
    /// <param name="content">File content as a byte array</param>
    /// <param name="contentType">MIME type, e.g. "image/png", "image/jpeg"</param>
    /// <returns>Image URL to insert into Markdown, e.g. "https://cdn.example.com/img/abc123.png"</returns>
    Task<string> UploadAsync(string fileName, byte[] content, string contentType);
    
    /// <summary>
    /// Maximum allowed file size in bytes.
    /// Default: 10 MB (10 * 1024 * 1024)
    /// Return 0 for no limit (not recommended).
    /// </summary>
    long MaxFileSizeBytes => 10 * 1024 * 1024;
    
    /// <summary>
    /// List of allowed MIME types.
    /// Default: JPEG, PNG, GIF, WebP (SVG disabled for security reasons).
    /// </summary>
    IReadOnlyList<string> AllowedContentTypes => new[]
    {
        "image/jpeg",
        "image/png",
        "image/gif",
        "image/webp"
    };
}
```

#### `ImageUploadHandlerBase` base class (recommended)

Instead of implementing `IImageUploadHandler` directly, **it is recommended to inherit from `ImageUploadHandlerBase`**. The base class provides:
- ✅ File size validation
- ✅ MIME type validation
- ✅ Magic bytes validation (the file's binary signature must match the declared MIME type)
- ✅ Generation of unique file names (Guid) with an extension based on the MIME type (not the client-provided name)
- ✅ MIME → extension mapping
- ✅ SVG blocked by default

You only need to implement one method, `SaveAsync()`:

```csharp
using SimpleTextEditor.Core.Services;

public class MyImageHandler : ImageUploadHandlerBase
{
    protected override Task<string> SaveAsync(string uniqueFileName, byte[] content, string contentType)
    {
        // Only save logic goes here - validation is already handled!
        // uniqueFileName is e.g. "a1b2c3d4-e5f6-7890-abcd-ef1234567890.png"
        throw new NotImplementedException();
    }
}
```

#### Example 1: Database (Entity Framework)

The simplest approach - the image as a `byte[]` in a table. Ideal when you don't want to configure external storage.

```csharp
using SimpleTextEditor.Core.Services;

public class DatabaseImageHandler : ImageUploadHandlerBase
{
    private readonly AppDbContext _dbContext;
    private readonly string _baseUrl;
    
    public DatabaseImageHandler(AppDbContext dbContext, string baseUrl)
    {
        _dbContext = dbContext;
        _baseUrl = baseUrl;
    }
    
    protected override async Task<string> SaveAsync(string uniqueFileName, byte[] content, string contentType)
    {
        var image = new ImageEntity
        {
            Id = Guid.NewGuid(),
            FileName = uniqueFileName,
            ContentType = contentType,
            Data = content,
            CreatedAt = DateTime.UtcNow
        };
        
        _dbContext.Images.Add(image);
        await _dbContext.SaveChangesAsync();
        
        return $"{_baseUrl}/api/images/{image.Id}";
    }
}

// Controller for serving images
[ApiController]
[Route("api/images")]
public class ImagesController : ControllerBase
{
    private readonly AppDbContext _dbContext;
    
    [HttpGet("{id}")]
    public async Task<IActionResult> GetImage(Guid id)
    {
        var image = await _dbContext.Images.FindAsync(id);
        if (image == null) return NotFound();
        
        return File(image.Data, image.ContentType);
    }
}
```

#### Example 2: File system

Saves files to disk, organizing them into folders by date. Good for simple deployments.

```csharp
using SimpleTextEditor.Core.Services;

public class FileSystemImageHandler : ImageUploadHandlerBase
{
    private readonly string _uploadPath;
    private readonly string _urlPrefix;
    
    public FileSystemImageHandler(string uploadPath, string urlPrefix)
    {
        _uploadPath = uploadPath;
        _urlPrefix = urlPrefix.TrimEnd('/');
        Directory.CreateDirectory(uploadPath);
    }
    
    protected override async Task<string> SaveAsync(string uniqueFileName, byte[] content, string contentType)
    {
        // Organize into folders by date
        var dateFolder = DateTime.UtcNow.ToString("yyyy-MM");
        var targetDir = Path.Combine(_uploadPath, dateFolder);
        Directory.CreateDirectory(targetDir);
        
        var filePath = Path.Combine(targetDir, uniqueFileName);
        await File.WriteAllBytesAsync(filePath, content);
        
        return $"{_urlPrefix}/{dateFolder}/{uniqueFileName}";
    }
    
    // Limit to 2 MB
    public override long MaxFileSizeBytes => 2 * 1024 * 1024;
}
```

#### Example 3: AWS S3 / CDN

Upload to Amazon S3 with an optional CDN (CloudFront). Requires the `AWSSDK.S3` package.

```csharp
using Amazon.S3;
using Amazon.S3.Model;
using SimpleTextEditor.Core.Services;

public class S3ImageHandler : ImageUploadHandlerBase
{
    private readonly IAmazonS3 _s3Client;
    private readonly string _bucketName;
    private readonly string _cdnBaseUrl;
    
    public S3ImageHandler(IAmazonS3 s3Client, string bucketName, string cdnBaseUrl)
    {
        _s3Client = s3Client;
        _bucketName = bucketName;
        _cdnBaseUrl = cdnBaseUrl.TrimEnd('/');
    }
    
    protected override async Task<string> SaveAsync(string uniqueFileName, byte[] content, string contentType)
    {
        var key = $"images/{DateTime.UtcNow:yyyy/MM/dd}/{uniqueFileName}";
        
        using var stream = new MemoryStream(content);
        await _s3Client.PutObjectAsync(new PutObjectRequest
        {
            BucketName = _bucketName,
            Key = key,
            InputStream = stream,
            ContentType = contentType,
            Headers = { CacheControl = "public, max-age=31536000" }
        });
        
        return $"{_cdnBaseUrl}/{key}";
    }
    
    // Limit to 5 MB
    public override long MaxFileSizeBytes => 5 * 1024 * 1024;
}
```

#### Example 4: Azure Blob Storage

Upload to Azure Blob with an optional CDN. Requires the `Azure.Storage.Blobs` package.

```csharp
using Azure.Storage.Blobs;
using Azure.Storage.Blobs.Models;
using SimpleTextEditor.Core.Services;

public class AzureBlobImageHandler : ImageUploadHandlerBase
{
    private readonly BlobContainerClient _container;
    private readonly string _cdnBaseUrl;
    
    public AzureBlobImageHandler(string connectionString, string containerName, string? cdnBaseUrl = null)
    {
        _container = new BlobContainerClient(connectionString, containerName);
        _container.CreateIfNotExists(PublicAccessType.Blob);
        _cdnBaseUrl = cdnBaseUrl ?? _container.Uri.ToString();
    }
    
    protected override async Task<string> SaveAsync(string uniqueFileName, byte[] content, string contentType)
    {
        var blobName = $"{DateTime.UtcNow:yyyy/MM/dd}/{uniqueFileName}";
        var blob = _container.GetBlobClient(blobName);
        
        await blob.UploadAsync(
            new BinaryData(content), 
            new BlobUploadOptions 
            { 
                HttpHeaders = new BlobHttpHeaders 
                { 
                    ContentType = contentType,
                    CacheControl = "public, max-age=31536000"
                } 
            });
        
        return $"{_cdnBaseUrl}/{blobName}";
    }
    
    // Limit to 5 MB
    public override long MaxFileSizeBytes => 5 * 1024 * 1024;
}
```

#### Registering the handler in DI

```csharp
// Program.cs

// Option 1: Database (the most common scenario)
builder.Services.AddScoped<IImageUploadHandler, DatabaseImageHandler>();

// Option 2: File system
builder.Services.AddSingleton<IImageUploadHandler>(
    new FileSystemImageHandler(
        Path.Combine(builder.Environment.WebRootPath, "uploads"),
        "/uploads"
    ));

// Option 3: AWS S3
builder.Services.AddSingleton<IImageUploadHandler>(sp =>
    new S3ImageHandler(
        sp.GetRequiredService<IAmazonS3>(),
        builder.Configuration["AWS:BucketName"]!,
        builder.Configuration["AWS:CdnUrl"]!
    ));

// Option 4: Azure Blob
builder.Services.AddSingleton<IImageUploadHandler>(sp =>
    new AzureBlobImageHandler(
        builder.Configuration["Azure:StorageConnectionString"]!,
        "editor-images",
        builder.Configuration["Azure:CdnUrl"]
    ));
```

---

### IMarkdownParser

Interface for Markdown ↔ HTML conversion.

#### Signature

```csharp
public interface IMarkdownParser
{
    /// <summary>
    /// Converts Markdown to HTML.
    /// </summary>
    /// <param name="markdown">Text in Markdown format</param>
    /// <returns>HTML ready to display</returns>
    string ToHtml(string markdown);
    
    /// <summary>
    /// Converts Markdown to plain text (strips formatting).
    /// Useful for search, previews, SEO.
    /// </summary>
    string ToPlainText(string markdown);
}
```

#### Default implementation

By default, `MarkdownService` is used, backed by the **Markdig** library supporting:
- Tables
- Task lists (checkboxes)
- Automatic links
- Code with syntax highlighting
- Emoji
- Footnotes
- **HTML sanitization** — a built-in security layer (HtmlSanitizer) neutralizes XSS payloads (`<script>`, `onerror`, `javascript:`, etc.) while preserving safe formatting

---

### IIconProvider

Interface for supplying icons for the toolbar.

#### Signature

```csharp
public interface IIconProvider
{
    /// <summary>
    /// Returns the icon identifier for the given action.
    /// </summary>
    /// <param name="actionName">Action name, e.g. "bold", "italic", "heading1"</param>
    /// <returns>
    /// Depending on the implementation:
    /// - Material Icons: "format_bold"
    /// - FontAwesome: "fa-bold"
    /// - Bootstrap Icons: "bi-type-bold"
    /// - SVG: "<svg>...</svg>"
    /// </returns>
    string GetIcon(string actionName);
    
    /// <summary>
    /// Returns the icon font link to add to <head>.
    /// Return an empty string if the icons are already loaded by the application.
    /// </summary>
    string GetIconFontLink();
}
```

#### List of supported action names

| actionName | Description |
|------------|--------------|
| `bold` | Bold |
| `italic` | Italic |
| `strikethrough` | Strikethrough |
| `heading1` | Heading H1 |
| `heading2` | Heading H2 |
| `heading3` | Heading H3 |
| `bulletList` | Bullet list |
| `numberedList` | Numbered list |
| `quote` | Quote |
| `code` | Inline code |
| `codeBlock` | Code block |
| `link` | Link |
| `image` | Image |
| `table` | Table |
| `horizontalRule` | Horizontal rule |
| `undo` | Undo |
| `redo` | Redo |
| `preview` | Preview |
| `fullscreen` | Fullscreen |
| `switchMode` | Switch mode |
| `alignLeft` | Align left |
| `alignCenter` | Align center |
| `alignRight` | Align right |

#### Example: FontAwesome 6

```csharp
public class FontAwesomeIconProvider : IIconProvider
{
    private readonly Dictionary<string, string> _icons = new()
    {
        // Text formatting
        ["bold"] = "fa-solid fa-bold",
        ["italic"] = "fa-solid fa-italic",
        ["strikethrough"] = "fa-solid fa-strikethrough",
        
        // Headings
        ["heading1"] = "fa-solid fa-heading",
        ["heading2"] = "fa-solid fa-h",
        ["heading3"] = "fa-solid fa-h",
        
        // Lists
        ["bulletList"] = "fa-solid fa-list-ul",
        ["numberedList"] = "fa-solid fa-list-ol",
        
        // Blocks
        ["quote"] = "fa-solid fa-quote-left",
        ["code"] = "fa-solid fa-code",
        ["codeBlock"] = "fa-solid fa-file-code",
        
        // Insertion
        ["link"] = "fa-solid fa-link",
        ["image"] = "fa-solid fa-image",
        ["table"] = "fa-solid fa-table",
        ["horizontalRule"] = "fa-solid fa-minus",
        
        // Actions
        ["undo"] = "fa-solid fa-rotate-left",
        ["redo"] = "fa-solid fa-rotate-right",
        ["preview"] = "fa-solid fa-eye",
        ["fullscreen"] = "fa-solid fa-expand",
        ["switchMode"] = "fa-solid fa-repeat",
        
        // Alignment
        ["alignLeft"] = "fa-solid fa-align-left",
        ["alignCenter"] = "fa-solid fa-align-center",
        ["alignRight"] = "fa-solid fa-align-right"
    };
    
    public string GetIcon(string actionName) => 
        _icons.TryGetValue(actionName, out var icon) ? icon : "fa-solid fa-question";
    
    public string GetIconFontLink() => 
        "<link href=\"https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css\" rel=\"stylesheet\" />";
}
```

#### Example: Bootstrap Icons

```csharp
public class BootstrapIconProvider : IIconProvider
{
    private readonly Dictionary<string, string> _icons = new()
    {
        ["bold"] = "bi-type-bold",
        ["italic"] = "bi-type-italic",
        ["strikethrough"] = "bi-type-strikethrough",
        ["heading1"] = "bi-type-h1",
        ["heading2"] = "bi-type-h2",
        ["heading3"] = "bi-type-h3",
        ["bulletList"] = "bi-list-ul",
        ["numberedList"] = "bi-list-ol",
        ["quote"] = "bi-quote",
        ["code"] = "bi-code",
        ["codeBlock"] = "bi-code-square",
        ["link"] = "bi-link-45deg",
        ["image"] = "bi-image",
        ["table"] = "bi-table",
        ["horizontalRule"] = "bi-dash-lg",
        ["undo"] = "bi-arrow-counterclockwise",
        ["redo"] = "bi-arrow-clockwise",
        ["preview"] = "bi-eye",
        ["fullscreen"] = "bi-fullscreen",
        ["switchMode"] = "bi-arrow-repeat"
    };
    
    public string GetIcon(string actionName) => 
        _icons.TryGetValue(actionName, out var icon) ? icon : "bi-question-circle";
    
    public string GetIconFontLink() => 
        "<link href=\"https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.0/font/bootstrap-icons.css\" rel=\"stylesheet\" />";
}
```

---

### ILocalizationProvider

Interface for translating the editor's user interface.

#### Signature

```csharp
public interface ILocalizationProvider
{
    /// <summary>
    /// Current language code (e.g. "pl", "en", "de").
    /// </summary>
    string CurrentLanguage { get; }
    
    /// <summary>
    /// Gets the translated text for a key.
    /// </summary>
    /// <param name="key">Translation key</param>
    /// <returns>Translated text, or the key itself if no translation exists</returns>
    string Get(string key);
    
    /// <summary>
    /// List of available languages.
    /// </summary>
    IEnumerable<string> GetAvailableLanguages();
    
    /// <summary>
    /// Changes the current language.
    /// </summary>
    void SetLanguage(string languageCode);
    
    /// <summary>
    /// Adds or overrides translations.
    /// </summary>
    void AddTranslations(IDictionary<string, string> translations);
}
```

#### List of translation keys

| Key | Description | Example (PL) |
|-----|--------------|---------------|
| `bold` | Tooltip: Bold | "Pogrubienie" |
| `italic` | Tooltip: Italic | "Kursywa" |
| `strikethrough` | Tooltip: Strikethrough | "Przekreślenie" |
| `heading1` | Tooltip: Heading 1 | "Nagłówek 1" |
| `heading2` | Tooltip: Heading 2 | "Nagłówek 2" |
| `heading3` | Tooltip: Heading 3 | "Nagłówek 3" |
| `bulletList` | Tooltip: Bullet list | "Lista punktowana" |
| `numberedList` | Tooltip: Numbered list | "Lista numerowana" |
| `quote` | Tooltip: Quote | "Cytat" |
| `code` | Tooltip: Code | "Kod" |
| `codeBlock` | Tooltip: Code block | "Blok kodu" |
| `link` | Tooltip: Insert link | "Wstaw link" |
| `image` | Tooltip: Insert image | "Wstaw obraz" |
| `table` | Tooltip: Insert table | "Wstaw tabelę" |
| `horizontalRule` | Tooltip: Horizontal rule | "Linia pozioma" |
| `undo` | Tooltip: Undo | "Cofnij" |
| `redo` | Tooltip: Redo | "Ponów" |
| `preview` | Tooltip: Preview | "Podgląd" |
| `fullscreen` | Tooltip: Fullscreen | "Pełny ekran" |
| `switchMode` | Tooltip: Switch mode | "Przełącz tryb" |
| `placeholder` | Editor placeholder text | "Zacznij pisać..." |
| `noPreview` | Text shown when there's nothing to preview | "Brak treści do podglądu" |
| `words` | Status bar label: words | "Słowa" |
| `characters` | Status bar label: characters | "Znaki" |
| `lines` | Status bar label: lines | "Linie" |

#### Example: Full Polish implementation

```csharp
public class PolishLocalizationProvider : ILocalizationProvider
{
    private string _currentLanguage = "pl";
    
    private readonly Dictionary<string, Dictionary<string, string>> _translations = new()
    {
        ["pl"] = new()
        {
            // Formatting
            ["bold"] = "Pogrubienie",
            ["italic"] = "Kursywa",
            ["strikethrough"] = "Przekreślenie",
            ["underline"] = "Podkreślenie",
            
            // Headings
            ["heading1"] = "Nagłówek 1",
            ["heading2"] = "Nagłówek 2",
            ["heading3"] = "Nagłówek 3",
            
            // Lists
            ["bulletList"] = "Lista punktowana",
            ["numberedList"] = "Lista numerowana",
            ["taskList"] = "Lista zadań",
            
            // Blocks
            ["quote"] = "Cytat",
            ["code"] = "Kod",
            ["codeBlock"] = "Blok kodu",
            
            // Insertion
            ["link"] = "Wstaw link",
            ["image"] = "Wstaw obraz",
            ["table"] = "Wstaw tabelę",
            ["horizontalRule"] = "Linia pozioma",
            
            // Alignment
            ["alignLeft"] = "Wyrównaj do lewej",
            ["alignCenter"] = "Wyśrodkuj",
            ["alignRight"] = "Wyrównaj do prawej",
            
            // Actions
            ["undo"] = "Cofnij",
            ["redo"] = "Ponów",
            ["preview"] = "Podgląd",
            ["fullscreen"] = "Pełny ekran",
            ["switchMode"] = "Przełącz tryb",
            
            // Other
            ["placeholder"] = "Zacznij pisać...",
            ["noPreview"] = "Brak treści do podglądu",
            ["words"] = "Słowa",
            ["characters"] = "Znaki",
            ["lines"] = "Linie",
            ["uploadImage"] = "Prześlij obraz",
            ["insertLink"] = "Wstaw link",
            ["linkUrl"] = "Adres URL",
            ["linkText"] = "Tekst linku"
        },
        ["en"] = new()
        {
            ["bold"] = "Bold",
            ["italic"] = "Italic",
            // ... English translations
        }
    };
    
    public string CurrentLanguage => _currentLanguage;
    
    public string Get(string key)
    {
        if (_translations.TryGetValue(_currentLanguage, out var langDict) &&
            langDict.TryGetValue(key, out var value))
        {
            return value;
        }
        return key; // Fall back to the key
    }
    
    public IEnumerable<string> GetAvailableLanguages() => _translations.Keys;
    
    public void SetLanguage(string languageCode)
    {
        if (_translations.ContainsKey(languageCode))
            _currentLanguage = languageCode;
    }
    
    public void AddTranslations(IDictionary<string, string> translations)
    {
        if (!_translations.ContainsKey(_currentLanguage))
            _translations[_currentLanguage] = new Dictionary<string, string>();
        
        foreach (var (key, value) in translations)
            _translations[_currentLanguage][key] = value;
    }
}
```

---

### IEditorTheme

Interface for defining custom editor themes.

#### Signature

```csharp
public interface IEditorTheme
{
    /// <summary>
    /// Theme name (identifier).
    /// </summary>
    string Name { get; }
    
    /// <summary>
    /// CSS class for the main editor container.
    /// </summary>
    string ContainerClass { get; }
    
    /// <summary>
    /// CSS class for the toolbar.
    /// </summary>
    string ToolbarClass { get; }
    
    /// <summary>
    /// CSS class for the editing area (textarea/WYSIWYG).
    /// </summary>
    string EditorClass { get; }
    
    /// <summary>
    /// CSS class for the preview panel.
    /// </summary>
    string PreviewClass { get; }
    
    /// <summary>
    /// Additional inline CSS styles (injected into the page).
    /// </summary>
    string AdditionalStyles { get; }
}
```

#### Example: Custom dark theme with a gradient

```csharp
public class GradientDarkTheme : IEditorTheme
{
    public string Name => "gradient-dark";
    
    public string ContainerClass => "ste-container ste-theme-gradient-dark";
    
    public string ToolbarClass => "ste-toolbar gradient-toolbar";
    
    public string EditorClass => "ste-editor dark-editor";
    
    public string PreviewClass => "ste-preview dark-preview";
    
    public string AdditionalStyles => @"
        .ste-theme-gradient-dark {
            --ste-bg: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
            --ste-text: #e0e0e0;
            --ste-border: #3d5a80;
            --ste-accent: #00d4ff;
        }
        
        .ste-theme-gradient-dark .ste-container {
            background: var(--ste-bg);
            color: var(--ste-text);
            border: 1px solid var(--ste-border);
            border-radius: 12px;
            overflow: hidden;
        }
        
        .gradient-toolbar {
            background: rgba(0, 0, 0, 0.3);
            backdrop-filter: blur(10px);
            border-bottom: 1px solid var(--ste-border);
            padding: 8px;
        }
        
        .gradient-toolbar button {
            background: transparent;
            color: var(--ste-text);
            border: none;
            border-radius: 6px;
            padding: 8px;
            transition: all 0.2s;
        }
        
        .gradient-toolbar button:hover {
            background: var(--ste-accent);
            color: #000;
        }
        
        .dark-editor {
            background: transparent;
            color: var(--ste-text);
            font-family: 'JetBrains Mono', monospace;
        }
        
        .dark-preview {
            background: rgba(255, 255, 255, 0.05);
            padding: 20px;
        }
        
        .dark-preview h1, .dark-preview h2, .dark-preview h3 {
            color: var(--ste-accent);
        }
    ";
}
```

---

## Models

### EditorMode

Enum specifying the editor's mode.

```csharp
public enum EditorMode
{
    /// <summary>
    /// Markdown mode - the user sees and edits raw Markdown source.
    /// Example view: "# Heading\n**bold text**"
    /// </summary>
    Markdown,
    
    /// <summary>
    /// WYSIWYG mode - the user sees formatted text as in Word.
    /// Example view: a heading and bold text displayed visually.
    /// </summary>
    Wysiwyg
}
```

#### When should you use which mode?

| Mode | Pros | Cons | Who is it for? |
|------|------|------|-----------------|
| **Wysiwyg** | Intuitive, "what you see is what you get" | Less control over formatting | Non-technical users |
| **Markdown** | Full control, portability | Requires knowing the syntax | Developers, technical writers |

```razor
<!-- For business users -->
<RadzenMarkdownEditor Mode="EditorMode.Wysiwyg" />

<!-- For developers/documentation -->
<RadzenMarkdownEditor Mode="EditorMode.Markdown" PreviewMode="PreviewMode.SideBySide" />
```

---

### PreviewMode

Enum specifying the preview mode (Markdown mode only).

```csharp
public enum PreviewMode
{
    /// <summary>
    /// No preview - Markdown editor only.
    /// Takes up 100% of the width.
    /// </summary>
    None,
    
    /// <summary>
    /// Editor and preview side by side (50/50).
    /// Ideal for wide screens.
    /// </summary>
    SideBySide,
    
    /// <summary>
    /// Switch between editor and preview.
    /// Ideal for narrow screens/mobile.
    /// </summary>
    Toggle
}
```

#### Visual comparison

```
┌─────────────────────────────────────────┐
│ PreviewMode.None                        │
├─────────────────────────────────────────┤
│                                         │
│         [Markdown Editor 100%]          │
│                                         │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│ PreviewMode.SideBySide                  │
├──────────────────┬──────────────────────┤
│                  │                      │
│  [Editor 50%]    │   [Preview 50%]      │
│                  │                      │
└──────────────────┴──────────────────────┘

┌─────────────────────────────────────────┐
│ PreviewMode.Toggle    [📝] [👁]         │
├─────────────────────────────────────────┤
│                                         │
│   [Either editor OR preview 100%]       │
│                                         │
└─────────────────────────────────────────┘
```

---

### ToolbarItem

Class representing a single button or separator in the toolbar.

#### Full definition

```csharp
public class ToolbarItem
{
    /// <summary>
    /// Unique identifier for the action.
    /// Used to identify which button was clicked.
    /// Examples: "bold", "italic", "heading1", "myCustomAction"
    /// </summary>
    public required string Id { get; init; }
    
    /// <summary>
    /// Icon name/class passed to IIconProvider.GetIcon().
    /// Examples: "format_bold", "fa-bold", "bi-type-bold"
    /// </summary>
    public required string Icon { get; init; }
    
    /// <summary>
    /// Key used to look up the translation from ILocalizationProvider.
    /// Displayed as a tooltip on hover.
    /// </summary>
    public required string TooltipKey { get; init; }
    
    /// <summary>
    /// Markdown syntax inserted BEFORE the selected text.
    /// Examples: "**" (bold), "*" (italic), "# " (heading)
    /// </summary>
    public string? MarkdownBefore { get; init; }
    
    /// <summary>
    /// Markdown syntax inserted AFTER the selected text.
    /// Examples: "**" (bold), "*" (italic), null (heading)
    /// </summary>
    public string? MarkdownAfter { get; init; }
    
    /// <summary>
    /// Is this a separator (a vertical line dividing button groups)?
    /// Separators are not clickable.
    /// </summary>
    public bool IsSeparator { get; init; }
    
    /// <summary>
    /// Should a new line be inserted before the syntax?
    /// True for block-level elements (headings, lists, quotes).
    /// </summary>
    public bool NewLineBefore { get; init; }
    
    /// <summary>
    /// Keyboard shortcut shown in the tooltip.
    /// Examples: "Ctrl+B", "Ctrl+I", "Ctrl+Shift+1"
    /// </summary>
    public string? Shortcut { get; init; }
    
    /// <summary>
    /// Static property creating a separator.
    /// </summary>
    public static ToolbarItem Separator => new()
    {
        Id = "separator",
        Icon = "",
        TooltipKey = "",
        IsSeparator = true
    };
}
```

### ToolbarItems (predefined)

A static class with ready-made button definitions.

```csharp
public static class ToolbarItems
{
    // Text formatting
    public static ToolbarItem Bold => new() { Id = "bold", Icon = "format_bold", TooltipKey = "bold", MarkdownBefore = "**", MarkdownAfter = "**", Shortcut = "Ctrl+B" };
    public static ToolbarItem Italic => new() { Id = "italic", Icon = "format_italic", TooltipKey = "italic", MarkdownBefore = "*", MarkdownAfter = "*", Shortcut = "Ctrl+I" };
    public static ToolbarItem Strikethrough => new() { Id = "strikethrough", Icon = "strikethrough_s", TooltipKey = "strikethrough", MarkdownBefore = "~~", MarkdownAfter = "~~" };
    
    // Headings
    public static ToolbarItem Heading1 => new() { Id = "heading1", Icon = "title", TooltipKey = "heading1", MarkdownBefore = "# ", NewLineBefore = true };
    public static ToolbarItem Heading2 => new() { Id = "heading2", Icon = "title", TooltipKey = "heading2", MarkdownBefore = "## ", NewLineBefore = true };
    public static ToolbarItem Heading3 => new() { Id = "heading3", Icon = "title", TooltipKey = "heading3", MarkdownBefore = "### ", NewLineBefore = true };
    
    // Lists
    public static ToolbarItem BulletList => new() { Id = "bulletList", Icon = "format_list_bulleted", TooltipKey = "bulletList", MarkdownBefore = "- ", NewLineBefore = true };
    public static ToolbarItem NumberedList => new() { Id = "numberedList", Icon = "format_list_numbered", TooltipKey = "numberedList", MarkdownBefore = "1. ", NewLineBefore = true };
    
    // Blocks
    public static ToolbarItem Quote => new() { Id = "quote", Icon = "format_quote", TooltipKey = "quote", MarkdownBefore = "> ", NewLineBefore = true };
    public static ToolbarItem Code => new() { Id = "code", Icon = "code", TooltipKey = "code", MarkdownBefore = "`", MarkdownAfter = "`" };
    public static ToolbarItem CodeBlock => new() { Id = "codeBlock", Icon = "code_blocks", TooltipKey = "codeBlock", MarkdownBefore = "```\n", MarkdownAfter = "\n```", NewLineBefore = true };
    
    // Insertion
    public static ToolbarItem Link => new() { Id = "link", Icon = "link", TooltipKey = "link", MarkdownBefore = "[", MarkdownAfter = "](url)" };
    public static ToolbarItem Image => new() { Id = "image", Icon = "image", TooltipKey = "image" };
    public static ToolbarItem Table => new() { Id = "table", Icon = "table_chart", TooltipKey = "table" };
    public static ToolbarItem HorizontalRule => new() { Id = "horizontalRule", Icon = "horizontal_rule", TooltipKey = "horizontalRule", MarkdownBefore = "\n---\n", NewLineBefore = true };
    
    // Actions
    public static ToolbarItem Undo => new() { Id = "undo", Icon = "undo", TooltipKey = "undo", Shortcut = "Ctrl+Z" };
    public static ToolbarItem Redo => new() { Id = "redo", Icon = "redo", TooltipKey = "redo", Shortcut = "Ctrl+Y" };
    public static ToolbarItem Preview => new() { Id = "preview", Icon = "visibility", TooltipKey = "preview" };
    public static ToolbarItem Fullscreen => new() { Id = "fullscreen", Icon = "fullscreen", TooltipKey = "fullscreen" };
    public static ToolbarItem SwitchMode => new() { Id = "switchMode", Icon = "swap_horiz", TooltipKey = "switchMode" };
    
    // Default set
    public static IReadOnlyList<ToolbarItem> Default => new[] { /* all of the above */ };
}
```

#### Example: Custom simplified toolbar

```csharp
// Only basic formatting - for a simple comment box
private static readonly IReadOnlyList<ToolbarItem> SimpleToolbar = new[]
{
    ToolbarItems.Bold,
    ToolbarItems.Italic,
    ToolbarItem.Separator,
    ToolbarItems.Link,
    ToolbarItems.Image
};

// Full toolbar for writing articles
private static readonly IReadOnlyList<ToolbarItem> ArticleToolbar = new[]
{
    ToolbarItems.Undo,
    ToolbarItems.Redo,
    ToolbarItem.Separator,
    ToolbarItems.Bold,
    ToolbarItems.Italic,
    ToolbarItems.Strikethrough,
    ToolbarItem.Separator,
    ToolbarItems.Heading1,
    ToolbarItems.Heading2,
    ToolbarItems.Heading3,
    ToolbarItem.Separator,
    ToolbarItems.BulletList,
    ToolbarItems.NumberedList,
    ToolbarItems.Quote,
    ToolbarItem.Separator,
    ToolbarItems.Code,
    ToolbarItems.CodeBlock,
    ToolbarItem.Separator,
    ToolbarItems.Link,
    ToolbarItems.Image,
    ToolbarItems.Table,
    ToolbarItems.HorizontalRule,
    ToolbarItem.Separator,
    ToolbarItems.Preview,
    ToolbarItems.Fullscreen,
    ToolbarItems.SwitchMode
};

// Custom button with a custom action
private static readonly ToolbarItem CustomEmojiButton = new()
{
    Id = "insertEmoji",
    Icon = "emoji_emotions",
    TooltipKey = "insertEmoji",
    MarkdownBefore = "😀"
};
```

---

## JavaScript Architecture

The editor requires a minimal amount of JavaScript for DOM operations that Blazor doesn't handle natively (textarea cursor, `document.execCommand`, image drag resize).

### File structure

| File | Description |
|------|--------------|
| `wwwroot/js/ste-interop.js` | Unified ES module — the only JS file in the project |
| `Services/SteJsInterop.cs` | C# wrapper — the only C# interop file |

### The `ste-interop.js` module

Split into 5 sections:

1. **Textarea operations** (Markdown mode) — `getSelection`, `setSelection`, `insertText`, `getCurrentLine`, `syncScroll`
2. **WYSIWYG operations** (contenteditable) — `execCommand`, `getHtml`, `setHtml`, `insertHtml`, `alignText`, `formatBlock`, `indent`, `outdent`
3. **WYSIWYG keyboard shortcuts** — `initKeyboardShortcuts`, `disposeKeyboardShortcuts` (Ctrl+B/I/U/K/Z/Y)
4. **Image drag & drop and pasting** — `initImageDragDrop`, `disposeImageDragDrop`
5. **Image resizing** — `initImageResize`, `disposeImageResize`, `setSelectedImageSize`, `deselectImage`

The module is loaded automatically by `SteJsInterop` using a dynamic `import()`. **You don't need to add a `<script>` tag** — a CSS reference is enough.

### `SteJsInterop.cs`

```csharp
// Creating the instance (in OnInitialized)
private SteJsInterop? _jsInterop;
_jsInterop = new SteJsInterop(JSRuntime);

// Usage (in OnAfterRenderAsync or event handlers)
await _jsInterop.ExecCommandAsync("bold");
await _jsInterop.InsertTextAsync(textarea, "**", "**", false);
await _jsInterop.InitImageResizeAsync(wysiwygRef, dotNetRef);

// Dispose (in DisposeAsync)
await _jsInterop.DisposeAsync();
```

---

## Image Resizing

In WYSIWYG mode, images can be resized interactively in two ways:

### Drag resize (dragging the corners)

1. Click an image → a blue frame appears with corner handles and a size label
2. Drag any handle → the image resizes while preserving its aspect ratio
3. Hold **Shift** while dragging → resize without preserving the aspect ratio
4. Press **Escape** → deselect the image
5. Press **Delete** / **Backspace** → remove the selected image

### Dimensions popup

1. **Double-click** an image → opens a popup with Width/Height fields
2. Or click the **size label** (e.g. "640 × 480") below the image
3. Enter exact dimensions → click "Apply"
4. The "Preserve aspect ratio" checkbox automatically recalculates the other dimension

### The `ImageResizePopup` component

The popup is a Blazor component (`ImageResizePopup.razor`) — it requires no extra configuration. It is rendered automatically by `RadzenMarkdownEditor` in WYSIWYG mode.

### Resize initialization

Resize is initialized automatically in `OnAfterRenderAsync` and reinitialized every time the mode is switched between WYSIWYG ↔ Markdown.

```csharp
// Internally, in RadzenMarkdownEditor:
protected override async Task OnAfterRenderAsync(bool firstRender)
{
    if (firstRender && _currentMode == EditorMode.Wysiwyg)
    {
        await _jsInterop.SetHtmlAsync(_wysiwygRef, html);
        await InitImageResize(); // Automatic initialization
    }
}
```

### Styling

Styles for resize are located in `wwwroot/css/wysiwyg.css` — classes:
- `.ste-img-selected` — blue frame around the selected image
- `.ste-img-overlay` — container for the handles
- `.ste-img-handle` / `.ste-img-handle-nw/ne/sw/se` — corner handles
- `.ste-img-size-label` — size label below the image
- `.ste-img-resize-popup` — dimensions popup

---

## Status Bar

The editor displays a status bar at the bottom with three counters updated in real time:

| Counter | Description |
|---------|--------------|
| **Words** | Word count (split on whitespace) |
| **Characters** | Total character count |
| **Lines** | Number of lines of text |

The status bar is always visible (regardless of the editing mode). Labels are translated via `ILocalizationProvider` using the `words`, `characters`, `lines` keys.

Style the bar with the `.ste-status-bar` CSS class — it can be overridden in the application's stylesheet.

---

## WYSIWYG Keyboard Shortcuts

The following keyboard shortcuts are available in WYSIWYG mode:

| Shortcut | Action |
|----------|--------|
| `Ctrl+B` | Bold |
| `Ctrl+I` | Italic |
| `Ctrl+U` | Underline |
| `Ctrl+K` | Insert link (shows a prompt with a URL field) |
| `Ctrl+Z` | Undo |
| `Ctrl+Y` | Redo |

Shortcuts are initialized automatically when switching to WYSIWYG mode and released when switching to Markdown mode or when the component is destroyed.

---

## Drag & Drop and Image Pasting (WYSIWYG)

In WYSIWYG mode, images can be inserted by:

1. **Dragging a file** (drag & drop) — drag an image file from the file system and drop it onto the editor area
2. **Pasting from the clipboard** (Ctrl+V) — paste an image copied from, e.g., a screenshot or the browser

The inserted image is passed to the configured `ImageUploadHandler` (the same way as when a file is chosen via the toolbar). The supported MIME types are those defined in `IImageUploadHandler.AllowedContentTypes`.

**JS → Blazor callback**: `OnImageDropped(string fileName, string base64, string contentType)` — invoked by JS after a drop/paste; validates size and type, then calls `UploadAsync` and inserts the URL into the editor.

---

## Security (Security Hardening)

SimpleTextEditor includes built-in security mechanisms protecting against the most common web attacks.

### Trust boundaries

```
User (untrusted)
    │
    ▼
┌─────────────────────────────────┐
│ Browser (JS interop)           │
│ • URL protocol validation      │
│ • Blocking javascript:/data:   │
│ • File count limit on drop/paste│
└───────────┬─────────────────────┘
            │
            ▼
┌─────────────────────────────────┐
│ Blazor Server (C#)             │
│ • HTML sanitization (allowlist)│
│ • Magic bytes validation       │
│ • Base64 size control          │
│ • Debounce with resource cleanup│
└───────────┬─────────────────────┘
            │
            ▼
┌─────────────────────────────────┐
│ Storage (trusted)              │
│ • Database / S3 / Blob         │
└─────────────────────────────────┘
```

### HTML sanitization (XSS)

All HTML generated by Markdig, as well as HTML entered in WYSIWYG mode, passes through a sanitizer based on an **allowlist**:

| Element | Allowed | Blocked |
|---------|---------|---------|
| **Tags** | `h1-h6`, `p`, `strong`, `em`, `a`, `img`, `table`, `ul`, `ol`, `code`, `pre`, `blockquote`... | `script`, `iframe`, `object`, `embed`, `form`, `style`... |
| **Attributes** | `href`, `src`, `alt`, `class`, `id`, `width`, `height`, `style` (with a CSS filter) | `onclick`, `onerror`, `onload`, `onmouseover`... |
| **URL protocols** | `http:`, `https:`, `mailto:`, `tel:` | `javascript:`, `vbscript:` |
| **data: URI** | Only `data:image/*` in the `img` tag's `src` attribute | `data:text/html`, `data:application/...` |

Raw HTML in Markdown is escaped (`DisableHtml()` in Markdig), which prevents code injection via `<script>` or `<img onerror=...>`.

### Image upload validation

When using `ImageUploadHandlerBase`:

1. **Size validation** — the file must fit within `MaxFileSizeBytes` (10 MB by default)
2. **MIME type validation** — only allowed types (`image/jpeg`, `image/png`, `image/gif`, `image/webp`)
3. **Magic bytes validation** — the file's binary signature must match the declared MIME type (protection against spoofing: an `.html` file with `Content-Type: image/png` will be rejected)
4. **Extension derived from MIME** — the file name is generated based on the verified MIME type, not the original name provided by the client
5. **SVG disabled by default** — SVG is an active format (it can contain `<script>`) and is not allowed by default

### DoS protection (drag & drop)

- The base64 size is estimated **before decoding** — payloads that are too large are rejected without allocating memory
- `Convert.TryFromBase64String` with a bounded buffer is used instead of `Convert.FromBase64String`
- Limit of simultaneous files in a single drop/paste: **10**

### No `eval()` in the code

All JS operations are performed through dedicated, exported functions in the `ste-interop.js` module

### Recommendations for production

1. **SignalR** — reduce `MaximumReceiveMessageSize` (2 MB in production, 10 MB in dev, by default)
2. **Rate limiting** — add rate limiting to the image upload endpoints
3. **CSP header** — configure Content-Security-Policy without `unsafe-eval`
4. **HTTPS** — enforce HTTPS in production (`UseHsts()`, `UseHttpsRedirection()`)

---

## Usage Examples

### 1. Basic editor

```razor
<RadzenMarkdownEditor @bind-Value="content" />

@code {
    private string content = "";
}
```

### 2. Editor with a dark theme and minimum height

```razor
<RadzenMarkdownEditor 
    @bind-Value="content" 
    Theme="dark"
    MinHeight="500" />
```

### 3. Read-only editor (article viewer)

```razor
<RadzenMarkdownEditor 
    @bind-Value="articleContent" 
    ReadOnly="true"
    Mode="EditorMode.Wysiwyg" />
```

### 4. Editor with upload to Azure Blob

```razor
@inject IImageUploadHandler ImageHandler

<RadzenMarkdownEditor 
    @bind-Value="content" 
    ImageUploadHandler="ImageHandler" />
```

### 5. Editor with a Polish UI

```razor
<RadzenMarkdownEditor 
    @bind-Value="content" 
    LocalizationProvider="@(new PolishLocalizationProvider())" />
```

### 6. Simple comment editor (limited toolbar)

```razor
<RadzenMarkdownEditor 
    @bind-Value="comment"
    ToolbarItems="_commentToolbar"
    MinHeight="150"
    MaxHeight="300"
    Placeholder="Add a comment..." />

@code {
    private string comment = "";
    
    private static readonly IReadOnlyList<ToolbarItem> _commentToolbar = new[]
    {
        ToolbarItems.Bold,
        ToolbarItems.Italic,
        ToolbarItem.Separator,
        ToolbarItems.Link,
        ToolbarItems.Code
    };
}
```

### 7. Article editor with auto-save

```razor
@inject IArticleService ArticleService

<RadzenMarkdownEditor 
    @bind-Value="article.Content"
    MinHeight="600"
    OnChange="HandleAutoSave" />

<div class="text-muted small mt-2">
    @if (isSaving)
    {
        <span>Saving...</span>
    }
    else if (lastSaved.HasValue)
    {
        <span>Last saved: @lastSaved.Value.ToString("HH:mm:ss")</span>
    }
</div>

@code {
    private Article article = new();
    private bool isSaving = false;
    private DateTime? lastSaved;
    private Timer? autoSaveTimer;
    
    private void HandleAutoSave(string content)
    {
        // Debounce - save after 2 seconds of inactivity
        autoSaveTimer?.Dispose();
        autoSaveTimer = new Timer(async _ =>
        {
            await InvokeAsync(async () =>
            {
                isSaving = true;
                StateHasChanged();
                
                await ArticleService.SaveDraftAsync(article);
                
                isSaving = false;
                lastSaved = DateTime.Now;
                StateHasChanged();
            });
        }, null, 2000, Timeout.Infinite);
    }
}
```

### 8. Article creation form with validation

```razor
@inject NavigationManager Navigation
@inject IArticleService ArticleService

<EditForm Model="article" OnValidSubmit="HandleSubmit">
    <DataAnnotationsValidator />
    
    <div class="mb-3">
        <label class="form-label">Title</label>
        <InputText @bind-Value="article.Title" class="form-control" />
        <ValidationMessage For="() => article.Title" />
    </div>
    
    <div class="mb-3">
        <label class="form-label">Category</label>
        <InputSelect @bind-Value="article.CategoryId" class="form-control">
            <option value="">-- Select a category --</option>
            @foreach (var cat in categories)
            {
                <option value="@cat.Id">@cat.Name</option>
            }
        </InputSelect>
        <ValidationMessage For="() => article.CategoryId" />
    </div>
    
    <div class="mb-3">
        <label class="form-label">Content</label>
        <RadzenMarkdownEditor 
            @bind-Value="article.Content" 
            MinHeight="500"
            ImageUploadHandler="imageHandler"
            LocalizationProvider="localizationProvider" />
        <ValidationMessage For="() => article.Content" />
    </div>
    
    <div class="mb-3">
        <label class="form-label">Tags</label>
        <InputText @bind-Value="article.Tags" class="form-control" placeholder="tag1, tag2, tag3" />
    </div>
    
    <div class="d-flex gap-2">
        <button type="submit" class="btn btn-primary" disabled="@isSubmitting">
            @if (isSubmitting)
            {
                <span class="spinner-border spinner-border-sm me-2"></span>
            }
            Publish
        </button>
        <button type="button" class="btn btn-secondary" @onclick="SaveDraft">
            Save as draft
        </button>
    </div>
</EditForm>

@code {
    private ArticleModel article = new();
    private List<Category> categories = new();
    private bool isSubmitting = false;
    
    private IImageUploadHandler imageHandler = new AzureBlobImageHandler(...);
    private ILocalizationProvider localizationProvider = new PolishLocalizationProvider();
    
    protected override async Task OnInitializedAsync()
    {
        categories = await ArticleService.GetCategoriesAsync();
    }
    
    private async Task HandleSubmit()
    {
        isSubmitting = true;
        article.Status = ArticleStatus.Published;
        await ArticleService.CreateAsync(article);
        Navigation.NavigateTo($"/articles/{article.Slug}");
    }
    
    private async Task SaveDraft()
    {
        article.Status = ArticleStatus.Draft;
        await ArticleService.SaveDraftAsync(article);
    }
}
```

### 9. Editor with a responsive preview (mobile-friendly)

```razor
<div class="editor-wrapper">
    <RadzenMarkdownEditor 
        @bind-Value="content"
        Mode="EditorMode.Markdown"
        PreviewMode="@currentPreviewMode"
        MinHeight="@GetMinHeight()" />
</div>

@code {
    private string content = "";
    
    [Inject] private IJSRuntime JS { get; set; } = default!;
    
    private PreviewMode currentPreviewMode = PreviewMode.SideBySide;
    
    protected override async Task OnAfterRenderAsync(bool firstRender)
    {
        if (firstRender)
        {
            // Use a dedicated JS function instead of eval
            var width = await JS.InvokeAsync<int>("getWindowWidth");
            currentPreviewMode = width < 768 ? PreviewMode.Toggle : PreviewMode.SideBySide;
            StateHasChanged();
        }
    }
    
    private int GetMinHeight() => currentPreviewMode == PreviewMode.Toggle ? 400 : 500;
}
```

### 10. Editor with a live preview (separate panel)

```razor
<div class="row">
    <div class="col-md-6">
        <h4>Editor</h4>
        <RadzenMarkdownEditor 
            @bind-Value="content"
            Mode="EditorMode.Markdown"
            PreviewMode="PreviewMode.None"
            MinHeight="600" />
    </div>
    <div class="col-md-6">
        <h4>Live preview</h4>
        <div class="preview-panel border rounded p-3" style="min-height: 600px;">
            @((MarkupString)htmlPreview)
        </div>
    </div>
</div>

@code {
    private string content = "";
    private string htmlPreview = "";
    
    [Inject] private IMarkdownParser MarkdownParser { get; set; } = default!;
    
    protected override void OnParametersSet()
    {
        htmlPreview = MarkdownParser.ToHtml(content);
    }
}
```

---

## Support

If you have questions or run into issues, open an issue in the project repository.
