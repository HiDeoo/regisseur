let isRepo = true
let isClean = true

export const simpleGit = () => {
  return {
    mockClean: (clean: boolean) => {
      isClean = clean
    },
    mockRepo: (repo: boolean) => {
      isRepo = repo
    },
    status: () => {
      if (isRepo) {
        return Promise.resolve({ isClean: () => isClean })
      }

      throw new Error('not a git repository')
    },
  }
}

declare module 'simple-git' {
  export interface SimpleGit {
    mockClean: (clean: boolean) => void
    mockRepo: (repo: boolean) => void
  }
}
