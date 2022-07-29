import cac from 'cac'

const cli = cac('regisseur')

cli.help()

cli.command('[file]', '// TODO').action(() => {
  console.log('no command')
})

cli.command('validate [file]', '// TODO').action(() => {
  console.log('validate')
})

async function run() {
  try {
    cli.parse(process.argv, { run: false })

    await cli.runMatchedCommand()
  } catch (error) {
    // TODO(HiDeoo)
    console.log('🚨 [cli.ts:12] error', error)

    process.exit(1)
  }
}

run()
