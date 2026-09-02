# SimpleTextEditor

A generic, configurable Markdown editor for Blazor applications. Distributed as a NuGet package with support for Radzen UI components.

📖 **[Full documentation](DOCUMENTATION_EN.md)** — a detailed description of the interfaces, with implementation examples for image handlers, localization, themes, and more.

## Features

- 📝 Full Markdown support (headings, bold, italic, lists, tables, images, code blocks)
- 🎨 Configurable themes (light/dark)
- 🌍 Built-in localization (EN, PL)
- 🔧 Extensible icon providers (Google Material Icons by default)
- 👁️ Live preview (side by side or toggle mode)
- ⚡ Easy integration with any database (returns plain Markdown/HTML strings)

## Screenshots

### Light theme — WYSIWYG
![WYSIWYG editor - light theme](img1.png)

### Code and quote rendering
![Code and quotes](img2.png)

### Dark theme
![Dark theme](img3.png)

## Installation

```bash
dotnet add package SimpleTextEditor.Radzen
```

## Quick Start

### 1. Register the services in `Program.cs`

```csharp
using SimpleTextEditor.Radzen.Extensions;

builder.Services.AddRadzenMarkdownEditor();
```

### 2. Add to `_Imports.razor`

```razor
@using SimpleTextEditor.Radzen.Components
```

### 3. Use the component

```razor
<RadzenMarkdownEditor 
    @bind-Value="@_content"
    PreviewMode="PreviewMode.SideBySide" />

@code {
    private string _content = "";
}
```

## Configuration

### Custom icons

```csharp
public class MyIconProvider : IIconProvider
{
    public string GetIcon(string name) => name switch
    {
        "bold" => "bi-type-bold",
        "italic" => "bi-type-italic",
        _ => $"bi-{name}"
    };
}

builder.Services.AddRadzenMarkdownEditor(options =>
{
    options.IconProvider = new MyIconProvider();
});
```

### CSS variables

Override these custom CSS properties in your application's stylesheet:

```css
:root {
    --ste-toolbar-bg: #1a1a2e;
    --ste-toolbar-button-color: #ffffff;
    --ste-editor-font-family: 'Fira Code', monospace;
    --ste-editor-font-size: 14px;
    --ste-preview-bg: #f5f5f5;
}
```

### Custom toolbar

```csharp
builder.Services.AddRadzenMarkdownEditor(options =>
{
    options.ToolbarItems = new[]
    {
        ToolbarItems.Bold,
        ToolbarItems.Italic,
        ToolbarItems.Separator,
        ToolbarItems.Heading1,
        ToolbarItems.BulletList
    };
});
```

### Localization

```csharp
builder.Services.AddRadzenMarkdownEditor(options =>
{
    options.Language = "pl";
    // Or provide custom translations:
    options.CustomTranslations = new Dictionary<string, string>
    {
        ["bold"] = "Pogrubienie",
        ["italic"] = "Kursywa"
    };
});
```

## License

MIT License — see the [LICENSE](LICENSE) file.

Author: Maurycy Bartczak
