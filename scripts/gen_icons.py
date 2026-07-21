from PIL import Image, ImageDraw

def make_icon(size, path):
    img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)

    bg = (15, 23, 42, 255)  # slate-950
    d.rounded_rectangle([0, 0, size - 1, size - 1], radius=size * 0.22, fill=bg)

    accent = (34, 211, 238, 255)  # cyan-400
    dark = (2, 6, 23, 255)

    cx, cy = size / 2, size / 2
    bar_w = size * 0.62
    bar_h = size * 0.075
    d.rounded_rectangle(
        [cx - bar_w / 2, cy - bar_h / 2, cx + bar_w / 2, cy + bar_h / 2],
        radius=bar_h / 2,
        fill=accent,
    )

    plate_w = size * 0.11
    plate_h = size * 0.30
    for side in (-1, 1):
        px = cx + side * (bar_w / 2 - plate_w * 0.55)
        d.rounded_rectangle(
            [px - plate_w / 2, cy - plate_h / 2, px + plate_w / 2, cy + plate_h / 2],
            radius=plate_w * 0.3,
            fill=accent,
        )
        inner_w = plate_w * 0.42
        inner_h = plate_h * 0.42
        d.rounded_rectangle(
            [px - inner_w / 2, cy - inner_h / 2, px + inner_w / 2, cy + inner_h / 2],
            radius=inner_w * 0.3,
            fill=dark,
        )

    img.save(path)

make_icon(192, "public/icons/icon-192.png")
make_icon(512, "public/icons/icon-512.png")
print("done")
