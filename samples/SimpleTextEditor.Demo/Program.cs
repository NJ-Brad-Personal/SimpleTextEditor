using Radzen;
using SimpleTextEditor.Demo.Components;
using SimpleTextEditor.Radzen.Extensions;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddRazorComponents()
    .AddInteractiveServerComponents();

// Configure SignalR for large message sizes (required for base64 images).
// UWAGA BEZPIECZEŃSTWO: Duży limit zwiększa powierzchnię DoS.
// W produkcji rozważ mniejszy limit (np. 1-2 MB) oraz rate limiting.
// Wartość powinna być dostosowana per-środowisko (Development vs Production).
builder.Services.AddSignalR(options =>
{
    options.MaximumReceiveMessageSize = builder.Environment.IsDevelopment()
        ? 10 * 1024 * 1024   // 10 MB — rozwój (wygoda)
        : 2 * 1024 * 1024;   // 2 MB — produkcja (bezpieczeństwo)
});

// Add Radzen services
builder.Services.AddRadzenComponents();

// Add SimpleTextEditor
builder.Services.AddRadzenMarkdownEditor(options =>
{
    options.Language = "en";
    options.Theme = "dark";
});

var app = builder.Build();

// Configure the HTTP request pipeline.
if (!app.Environment.IsDevelopment())
{
    app.UseExceptionHandler("/Error", createScopeForErrors: true);
    app.UseHsts();
}
app.UseStatusCodePagesWithReExecute("/not-found", createScopeForStatusCodePages: true);
app.UseHttpsRedirection();

app.UseAntiforgery();

app.MapStaticAssets();
app.MapRazorComponents<App>()
    .AddInteractiveServerRenderMode();

app.Run();
