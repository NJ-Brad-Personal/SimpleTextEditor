using Markdig;
using SimpleTextEditor.Core.Abstractions;

namespace SimpleTextEditor.Core.Services;

/// <summary>
/// Implementacja parsera Markdown przy użyciu biblioteki Markdig.
/// </summary>
public class MarkdownService : IMarkdownParser
{
    // Pipeline jest niezmienny i bezpieczny wątkowo — budujemy go raz dla całego procesu.
    // Budowanie pipeline'u to ~0,1 ms; wcześniej odbywało się przy każdym renderze komponentu.
    private static readonly MarkdownPipeline SharedPipeline = BuildPipeline();

    private readonly MarkdownPipeline _pipeline = SharedPipeline;

    private static MarkdownPipeline BuildPipeline()
    {
        return new MarkdownPipelineBuilder()
            .UseAdvancedExtensions()
            .UseEmojiAndSmiley()
            .UseAutoLinks()
            .UseTaskLists()
            .UsePipeTables()
            .UseGridTables()
            .UseFootnotes()
            .UseAutoIdentifiers()
            .DisableHtml()
            .Build();
    }

    /// <inheritdoc />
    public string ToHtml(string markdown)
    {
        if (string.IsNullOrEmpty(markdown))
            return string.Empty;

        var rawHtml = Markdown.ToHtml(markdown, _pipeline);
        return HtmlSanitizationService.Sanitize(rawHtml);
    }
    
    /// <inheritdoc />
    public string ToPlainText(string markdown)
    {
        if (string.IsNullOrEmpty(markdown))
            return string.Empty;
        
        return Markdown.ToPlainText(markdown, _pipeline);
    }
}
