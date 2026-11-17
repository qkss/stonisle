// Mechanical atlas packing only; artwork is generated with imagegen.
import AppKit
let dir = URL(fileURLWithPath: CommandLine.arguments.count > 1 ? CommandLine.arguments[1] : "texture-packs/natural-v1")
func read(_ name: String) -> CGImage {
    let image = NSImage(contentsOf: dir.appendingPathComponent(name))!
    return image.cgImage(forProposedRect: nil, context: nil, hints: nil)!
}
let sheet = read("materials-preview.png"), leaves = read("leaves-source.png")
let cellW = Double(sheet.width) / 4, cellH = Double(sheet.height) / 5
for size in [128, 256] {
    let context = CGContext(data: nil, width: size * 32, height: size, bitsPerComponent: 8, bytesPerRow: size * 32 * 4, space: CGColorSpaceCreateDeviceRGB(), bitmapInfo: CGImageAlphaInfo.premultipliedLast.rawValue)!
    context.interpolationQuality = .high
    for tile in 0..<32 {
        let source: CGImage
        if tile == 8 { source = leaves }
        else {
            let index = tile < 17 ? tile : 17
            // Round boundaries independently to avoid accumulating rounding error.
            let x0 = Int((Double(index % 4) * cellW).rounded())
            let y0 = Int((Double(index / 4) * cellH).rounded())
            let x1 = Int((Double(index % 4 + 1) * cellW).rounded())
            let y1 = Int((Double(index / 4 + 1) * cellH).rounded())
            source = sheet.cropping(to: CGRect(x: x0, y: y0, width: x1-x0, height: y1-y0))!
        }
        context.draw(source, in: CGRect(x: tile * size, y: 0, width: size, height: size))
    }
    let output = NSBitmapImageRep(cgImage: context.makeImage()!)
    let data = output.representation(using: .png, properties: [:])!
    let name = "stonisle-natural-\(size).png"
    try data.write(to: dir.appendingPathComponent(name))
    var transparent = 0
    for y in 0..<size { for x in (8*size)..<(9*size) {
        if output.colorAt(x: x, y: y)!.alphaComponent < 0.5 { transparent += 1 }
    }}
    print("\(name): \(output.pixelsWide)x\(output.pixelsHigh), \(data.count) bytes, leaf cutout pixels: \(transparent)")
}
