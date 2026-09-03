using SimpleTextEditor.Core.Abstractions;
using SimpleTextEditor.Core.Services;

namespace SimpleTextEditor.Core.Tests.Services;

public class Base64ImageUploadHandlerTests
{
    private readonly Base64ImageUploadHandler _sut = new();

    [Fact]
    public async Task UploadAsync_ValidImage_ReturnsDataUri()
    {
        var content = new byte[] { 0x89, 0x50, 0x4E, 0x47 }; // PNG header
        
        var result = await _sut.UploadAsync("test.png", content, "image/png");
        
        Assert.StartsWith("data:image/png;base64,", result);
    }

    [Fact]
    public async Task UploadAsync_ReturnsCorrectBase64()
    {
        var content = new byte[] { 0xFF, 0xD8, 0xFF, 0xE0 }; // JPEG header (SOI + APP0)
        var expectedBase64 = Convert.ToBase64String(content);

        var result = await _sut.UploadAsync("file.jpg", content, "image/jpeg");

        Assert.Equal($"data:image/jpeg;base64,{expectedBase64}", result);
    }

    [Fact]
    public async Task UploadAsync_ContentDoesNotMatchDeclaredType_Throws()
    {
        // Bytes don't match any known image signature for "image/png" (magic-byte validation
        // inherited from ImageUploadHandlerBase). The user must fix the file before uploading —
        // the handler no longer silently trusts the declared content type.
        var content = new byte[] { 1, 2, 3, 4 };

        await Assert.ThrowsAsync<InvalidOperationException>(
            () => _sut.UploadAsync("file.png", content, "image/png"));
    }

    [Fact]
    public void DefaultMaxFileSize_Is10MB()
    {
        IImageUploadHandler handler = _sut;
        Assert.Equal(10 * 1024 * 1024, handler.MaxFileSizeBytes);
    }

    [Fact]
    public void DefaultAllowedTypes_ContainsExpectedTypes()
    {
        IImageUploadHandler handler = _sut;
        var types = handler.AllowedContentTypes;

        Assert.Contains("image/jpeg", types);
        Assert.Contains("image/png", types);
        Assert.Contains("image/gif", types);
        Assert.Contains("image/webp", types);
    }

    [Fact]
    public void DefaultAllowedTypes_DoesNotContainSvg()
    {
        IImageUploadHandler handler = _sut;
        var types = handler.AllowedContentTypes;

        Assert.DoesNotContain("image/svg+xml", types);
    }
}
