using Microsoft.AspNetCore;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.FileProviders;

public class Program
{
    public static void Main(string[] args)
    {
        // Main ASP.NET Core app (port 8000)
        var mainHost = WebHost.CreateDefaultBuilder(args)
            .UseStartup<Startup>()
            .UseUrls("http://localhost:8000")
            .Build();

        // Vite build static file server (port 5000)
        var viteHost = WebHost.CreateDefaultBuilder(args)
            .UseUrls("http://localhost:5000")
            .Configure(app =>
            {
                app.UseDefaultFiles();
                app.UseStaticFiles(new StaticFileOptions
                {
                    FileProvider = new PhysicalFileProvider(
                        Path.Combine(Directory.GetCurrentDirectory(), "dist")
                    )
                });

                app.Run(async context =>
                {
                    context.Response.ContentType = "text/html";
                    await context.Response.SendFileAsync(Path.Combine("dist", "index.html"));
                });
            })
            .Build();

        // Run both servers in parallel
        Task.WaitAll(
            mainHost.RunAsync(),
            viteHost.RunAsync()
        );
    }
}