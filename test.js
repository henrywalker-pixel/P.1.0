
class Test extends Point  {
    constructor(x, y) {
        super(x, y)
    }

    corner(line1, line2, radius, style) {
        // line = [vp, length, dir, r, style]

        let f1 = this.line(line1[0], line1[1], line1[2], line1[3] || 0, 0, 0, 0, line1[4] || this.attri["line-style"])[1]
        let f2 = this.line(line2[0], line2[1], line2[2], line2[3] || 0, 0, 0, 0, line2[4] || this.attri["line-style"])[1]


        ctx.beginPath()
        ctx.strokeStyle = style || this.attri["line-style"]
        ctx.moveTo(f1.x, f1.y)
        ctx.arcTo(this.x, this.y, f2.x, f2.y, 50)
        ctx.stroke()
        ctx.closePath()
    }

}

let point = position(200, 1, 100, 1, 100, 1)
let test = new Test(point.x, point.y)

test.corner([vp.left_vp, 100, 1, 0], [vp.right_vp, 100, 1, 0])
test.corner([1, 100, 1, 0], [0, 100, 1, 0])