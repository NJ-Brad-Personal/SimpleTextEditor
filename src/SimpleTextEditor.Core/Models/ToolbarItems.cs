namespace SimpleTextEditor.Core.Models;

/// <summary>
/// Predefiniowane elementy paska narzędzi dla typowych akcji Markdown.
/// </summary>
public static class ToolbarItems
{
    public static ToolbarItem Bold => new()
    {
        Id = "bold",
        Icon = "bold",
        TooltipKey = "bold",
        MarkdownBefore = "**",
        MarkdownAfter = "**",
        Shortcut = "Ctrl+B"
    };
    
    public static ToolbarItem Italic => new()
    {
        Id = "italic",
        Icon = "italic",
        TooltipKey = "italic",
        MarkdownBefore = "*",
        MarkdownAfter = "*",
        Shortcut = "Ctrl+I"
    };
    
    public static ToolbarItem Strikethrough => new()
    {
        Id = "strikethrough",
        Icon = "strikethrough",
        TooltipKey = "strikethrough",
        MarkdownBefore = "~~",
        MarkdownAfter = "~~"
    };
    
    public static ToolbarItem Heading1 => new()
    {
        Id = "heading1",
        Icon = "heading1",
        TooltipKey = "heading1",
        MarkdownBefore = "# ",
        NewLineBefore = true
    };
    
    public static ToolbarItem Heading2 => new()
    {
        Id = "heading2",
        Icon = "heading2",
        TooltipKey = "heading2",
        MarkdownBefore = "## ",
        NewLineBefore = true
    };
    
    public static ToolbarItem Heading3 => new()
    {
        Id = "heading3",
        Icon = "heading3",
        TooltipKey = "heading3",
        MarkdownBefore = "### ",
        NewLineBefore = true
    };
    
    public static ToolbarItem BulletList => new()
    {
        Id = "bulletList",
        Icon = "bulletList",
        TooltipKey = "bulletList",
        MarkdownBefore = "- ",
        NewLineBefore = true
    };
    
    public static ToolbarItem NumberedList => new()
    {
        Id = "numberedList",
        Icon = "numberedList",
        TooltipKey = "numberedList",
        MarkdownBefore = "1. ",
        NewLineBefore = true
    };
    
    public static ToolbarItem Quote => new()
    {
        Id = "quote",
        Icon = "quote",
        TooltipKey = "quote",
        MarkdownBefore = "> ",
        NewLineBefore = true
    };
    
    public static ToolbarItem Code => new()
    {
        Id = "code",
        Icon = "code",
        TooltipKey = "code",
        MarkdownBefore = "`",
        MarkdownAfter = "`"
    };
    
    public static ToolbarItem CodeBlock => new()
    {
        Id = "codeBlock",
        Icon = "codeBlock",
        TooltipKey = "codeBlock",
        MarkdownBefore = "```\n",
        MarkdownAfter = "\n```",
        NewLineBefore = true
    };
    
    public static ToolbarItem Link => new()
    {
        Id = "link",
        Icon = "link",
        TooltipKey = "link",
        MarkdownBefore = "[",
        MarkdownAfter = "](url)"
    };
    
    public static ToolbarItem Image => new()
    {
        Id = "image",
        Icon = "image",
        TooltipKey = "image",
        MarkdownBefore = "![",
        MarkdownAfter = "](url)",
        NewLineBefore = true
    };
    
    public static ToolbarItem Table => new()
    {
        Id = "table",
        Icon = "table",
        TooltipKey = "table",
        MarkdownBefore = "\n| Header 1 | Header 2 | Header 3 |\n|----------|----------|----------|\n| Cell 1   | Cell 2   | Cell 3   |\n",
        NewLineBefore = true
    };
    
    public static ToolbarItem HorizontalRule => new()
    {
        Id = "horizontalRule",
        Icon = "horizontalRule",
        TooltipKey = "horizontalRule",
        MarkdownBefore = "\n---\n",
        NewLineBefore = true
    };
    
    public static ToolbarItem AlignLeft => new()
    {
        Id = "alignLeft",
        Icon = "alignLeft",
        TooltipKey = "alignLeft",
        MarkdownBefore = "",
        MarkdownAfter = " {.text-left}",
        NewLineBefore = true
    };
    
    public static ToolbarItem AlignCenter => new()
    {
        Id = "alignCenter",
        Icon = "alignCenter",
        TooltipKey = "alignCenter",
        MarkdownBefore = "",
        MarkdownAfter = " {.text-center}",
        NewLineBefore = true
    };
    
    public static ToolbarItem AlignRight => new()
    {
        Id = "alignRight",
        Icon = "alignRight",
        TooltipKey = "alignRight",
        MarkdownBefore = "",
        MarkdownAfter = " {.text-right}",
        NewLineBefore = true
    };
    
    public static ToolbarItem Undo => new()
    {
        Id = "undo",
        Icon = "undo",
        TooltipKey = "undo",
        Shortcut = "Ctrl+Z"
    };
    
    public static ToolbarItem Redo => new()
    {
        Id = "redo",
        Icon = "redo",
        TooltipKey = "redo",
        Shortcut = "Ctrl+Y"
    };
    
    public static ToolbarItem Preview => new()
    {
        Id = "preview",
        Icon = "preview",
        TooltipKey = "preview"
    };
    
    public static ToolbarItem Fullscreen => new()
    {
        Id = "fullscreen",
        Icon = "fullscreen",
        TooltipKey = "fullscreen"
    };
    
    public static ToolbarItem SwitchMode => new()
    {
        Id = "switchMode",
        Icon = "switchMode",
        TooltipKey = "switchMode"
    };
    
    public static ToolbarItem Separator => ToolbarItem.Separator;
    
    /// <summary>
    /// Pobiera domyślne elementy paska narzędzi.
    /// </summary>
    public static IReadOnlyList<ToolbarItem> Default => DefaultItems;

    // Cache'owane: elementy są tylko odczytywane, a wcześniej każdy dostęp do Default
    // alokował komplet nowych obiektów — przy każdym renderze edytora, z nową
    // referencją tablicy, co wymuszało również ponowny render całego paska narzędzi.
    private static readonly IReadOnlyList<ToolbarItem> DefaultItems = new[]
    {
        SwitchMode,
        Separator,
        Bold, Italic, Strikethrough,
        Separator,
        Heading1, Heading2, Heading3,
        Separator,
        BulletList, NumberedList, Quote,
        Separator,
        AlignLeft, AlignCenter, AlignRight,
        Separator,
        Link, Image, Table,
        Separator,
        Code, CodeBlock, HorizontalRule,
        Separator,
        Undo, Redo,
        Separator,
        Preview, Fullscreen
    };
}
